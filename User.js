const { model, Schema } = require("mongoose");
const { isEmail, isLowercase } = require("validator");
const { encryptPassword, checkPassword } = require("../bcrypt");
const { generateToken } = require("../jwt");

const UserSchema = new Schema({
    firstName: {
        type: String,
        trim: true,
        required: true
    },
    lastName: {
        type: String,
        trim: true,
        required: true
    },
    email: {
        type: String,
        lowercase: true,
        trim: true,
        required: true,
        unique: true,
        validate: {
            validator(email) {
                return isEmail(email);
            }
        }
    },
    password: {
        type: String,
        trim: true,
        required: true,
        minlength: 8,
        validate: {
            validator(password) {
                if (password.includes(" ") || password.includes("\n") || password.includes("\t")) {
                    throw new Error(`Password must not include space/tab/newline characters.`);
                }
                if (password.toLowerCase().includes("password")) {
                    throw new Error(`Password must not contain 'password'`);
                }
                return true;
            }
        }
    },
    type: {
        type: String,
        enum: ["STUDENT", "LIBRARIAN"],
        default: "STUDENT",
    },
    tokens: {
        type: [{ token: String }]
    }
},
    { timestamps: true }
);

UserSchema.pre("save", async function (next) {
    const user = this;
    if (user.modifiedPaths().includes("password")) {
        user.password = await encryptPassword(user.password);
    }
    next();
})

UserSchema.statics.findByEmailAndPasswordForAuth = async (email, password) => {
    try {
        const user = await User.findOne({ email });
        if (!user) {
            throw new Error(`Login Failed`);
        }
        const encryptedPassword = user.password;
        const isMatch = await checkPassword(password, encryptedPassword);
        if (!isMatch) {
            throw new Error(`Login Failed`);
        }
        console.log(`Login Successful`);
        return user;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

UserSchema.methods.generateToken = function () {
    const user = this;
    const token = generateToken(user);
    user.tokens.push({ token });
    user.save();
    return token;
}

UserSchema.methods.toJSON = function () {
    let user = this.toObject();
    delete user.tokens;
    return user;
}

const User = model("User", UserSchema);

module.exports = User;