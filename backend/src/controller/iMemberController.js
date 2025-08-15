import fs from "fs";
import csv from "csv-parser";
import Member from "../models/Member";

export const importMemberFromCSV = async (req, res) => {
    try {
        const filePath = req.file.path;
        const members = [];

        await new Promise((resolve, reject) => {
            fs.createReadStream(filePath)
                .pipe(csv())
                .on("data", (row) => {
                    members.push({
                        firstName: row.firstName?.trim(),
                        lastName: row.lastName?.trim(),
                        phone: row.phone?.trim(),
                        address: row.address?.trim(),
                        birthdate: row.birthdate?.trim(),
                        gender: row.gender?.trim(),
                        occupation: row.occupation?.trim(),
                    });
                })
                .on("end", resolve)
                .on("error", reject);
        });

        const existing = await Member.find({}, { firstName: 1, lastName: 1 }).lean();
        const existingFirstName = new Set(existing.map((m) => m.firstName).filter(Boolean));
        const existingLastName = new Set(existing.map((m) => m.lastName).filter(Boolean));

        const newMembers = members.filter(
            (m) =>
                !existingFirstName.has(m.firstName) &&
                !existingLastName.has(m.lastName)
        );

        if (newMembers.length > 0) {
            await Member.insertMany(newMembers);
        }

        fs.unlinkSync(filePath); // delete uploaded file after processing
        res.json({
            message: `Imported ${newMembers.length} members (Skipped ${members.length - newMembers.length
                } duplicates)`,
        });
    } catch (error) {
        res.status(500).json({ error: "Import failed", details: error.message });
    }
}