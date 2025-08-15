import fs from "fs";
import csv from "csv-parser";
import path, { resolve } from "path";
import connectDB from "./db.js";
import Member from "../models/Member.js";
//import { rejects } from "assert";

export async function importCSV() {
    try {
        await connectDB();

        const filePath = path.join(__dirname, "../../members.csv");

        const members = [];
        await new Promise((resolve, rejects) => {
            fs.createReadStream(filePath)
            .pipe(csv())
            .on("data", (row) => {
                members.push({
                    firsName: row.firsName?.trim(),
                    lastName: row.lastName?.trim(),
                    phone: row.phone?.trim(),
                    address: row.address?.trim(),
                    birthdate: row.birthdate?.trim(),
                    gender:row.gender?.trim(),
                    occupation:row.occupation?.trim()

                })
            })
            .on("end", resolve)
            .on("error", rejects)
        })
        if(members.length === 0){
            console.log("No data found in csv");
            process.exit();
        }

        //Get all existing names 
        const existing = await Member.find(
            {$or: [{firstName: {$ne: null}}, {lastName: {$ne: null}}]},
            {firstName: 1, lastName: 1, _id: 0}
        ).lean();

        const existingFirstName = new Set(existing.map((m) => m.firstName).filter(Boolean));
        const existingLastName = new Set(existing.map((m) => m.lastName).filter(Boolean))

        //Filter out duplicate before inserting
        const newMembers = members.filter(
            (m) =>
                !existingFirstName.has(m.lastName) && !existingLastName.has(m.lastName)
        );
        if(newMembers.length === 0){
            console.log("No new members to import all are duplicated");
            process.exit()
        }
        //Bulk insert new members
        await Member.insertMany(newMembers);
        console.log(`Imported ${newMembers.length} new members (Skipped ${members.length - newMembers.length} duplicates)`)
        process.exit()
    } catch (error) {
        console.error("Error importing members", error);
        process.exit(1);
    }
}