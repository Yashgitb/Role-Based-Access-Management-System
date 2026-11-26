import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

import connectDB from "../config/db.js";
import Role from "../models/Role.js";
import User from "../models/User.js";

dotenv.config();

const seedDatabase = async () => {
    try {
        await connectDB();

        // Permission configurations for admin ,manager and employee
        const fullAccess = {
            view: true,
            create: true,
            edit: true,
            delete: true
        };

        const viewOnly = {
            view: true,
            create: false,
            edit: false,
            delete: false
        };

        const profileAccess = {
            view: true,
            create: false,
            edit: true,
            delete: false
        };

        // Validate Admin credentials
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (!adminEmail || !adminPassword || !process.env.ADMIN_NAME) {
            throw new Error("Admin credentials are missing");
        }
       
        //Creating Admin Role
        let adminRole = await Role.findOne({ name: "Admin" });

        if (!adminRole) {
            adminRole = await Role.create({
                name: "Admin",
                permissions: {
                    dashboard: viewOnly,
                    userManagement: fullAccess,
                    roleManagement: fullAccess,
                    reports: fullAccess,
                    settings: fullAccess,
                    myProfile: profileAccess
                }
            });

            console.log("Admin role created");
        }

        //Creating Manager Role
        const managerRole = await Role.findOne({
            name: "Manager"
        });

        if (!managerRole) {
            await Role.create({
                name: "Manager",
                permissions: {
                    dashboard: viewOnly,
                    userManagement: viewOnly,
                    reports: viewOnly,
                    myProfile: profileAccess
                }
            });

            console.log("Manager role created");
        }

        // 3. Create Employee Role
        const employeeRole = await Role.findOne({
            name: "Employee"
        });

        if (!employeeRole) {
            await Role.create({
                name: "Employee",
                permissions: {
                    dashboard: viewOnly,
                    myProfile: profileAccess
                }
            });

            console.log("Employee role created");
        }

        // 4. Checking whether Admin user already exists
        const existingAdmin = await User.findOne({
            email: adminEmail.trim().toLowerCase()
        });


        // 5. Creating first Admin user
        if (!existingAdmin) {

            const hashedPassword = await bcrypt.hash(
                adminPassword,
                10
            );

            await User.create({
                name: process.env.ADMIN_NAME,
                email: adminEmail,
                password: hashedPassword,
                role: adminRole._id,
                isActive: true
            });

            console.log("Admin user created");

        } else {
            console.log("Admin email already exists; user unchanged");
        }

        console.log("Database seeding completed");

    } catch (error) {
        console.error("Seeding failed:", error.message);
        process.exitCode = 1;

    } finally {
        await mongoose.disconnect();
    }
};

seedDatabase();