const bcrypt = require("bcryptjs");
const User = require("../models/User");

const getAllUsers = async ({ search, role, isActive } = {}) => {
    const filter = {};

    if (role) {
        filter.role = role;
    }

    if (typeof isActive !== "undefined") {
        filter.isActive = isActive === "true" || isActive === true;
    }

    if (search) {
        filter.$or = [
            {
                name: {
                    $regex: search,
                    $options: "i",
                },
            },
            {
                email: {
                    $regex: search,
                    $options: "i",
                },
            },
        ];
    }

    const users = await User.find(filter)
        .select("-password")
        .sort({ createdAt: -1 });

    return users;
};

const createUser = async ({
    name,
    email,
    password,
    role = "TEAM_MEMBER",
}) => {
    const existingUser = await User.findOne({
        email: email.toLowerCase().trim(),
    });

    if (existingUser) {
        throw new Error("A user with this email already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role,
        isActive: true,
    });

    const result = user.toObject();

    delete result.password;

    return result;
};

const updateUser = async (userId, data) => {
    const user = await User.findById(userId);

    if (!user) {
        throw new Error("User not found");
    }

    if (data.name !== undefined) {
        user.name = data.name.trim();
    }

    if (data.email !== undefined) {
        const normalizedEmail = data.email
            .toLowerCase()
            .trim();


        const existingUser = await User.findOne({
            email: normalizedEmail,
            _id: { $ne: userId },
        });

        if (existingUser) {
            throw new Error(
                "Another user already uses this email"
            );
        }

        user.email = normalizedEmail;


    }

    if (data.role !== undefined) {
        if (
            !["TEAM_MEMBER", "ADMIN"].includes(data.role)
        ) {
            throw new Error("Invalid user role");
        }

        user.role = data.role;


    }

    if (data.isActive !== undefined) {
        user.isActive = Boolean(data.isActive);
    }

    if (data.password) {
        user.password = await bcrypt.hash(
            data.password,
            10
        );
    }

    await user.save();

    const result = user.toObject();

    delete result.password;

    return result;
};

const deactivateUser = async (userId) => {
    const user = await User.findById(userId);

    if (!user) {
        throw new Error("User not found");
    }

    user.isActive = false;

    await user.save();

    const result = user.toObject();

    delete result.password;

    return result;
};

module.exports = {
    getAllUsers,
    createUser,
    updateUser,
    deactivateUser,
};
