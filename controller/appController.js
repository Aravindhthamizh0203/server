import UserModel from "../model/User.model.js";
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import ENV from '../config.js'
import connect from "../database/conn.js";


export async function verifyUser(req, res, next) {
    try {
        const { username } = req.method == 'GET' ? req.query : req.body;


        let exist = await UserModel.findOne({ username });
        if (!exist) return res.status(404).send({ error: "can't find user" });
        next();
    } catch (error) {
        return res.status(400).send({ error: "authtication error" });
    }
}









/** POST:*/
/**register-post */
export async function register(req, res) {

    try {
        const { username, password, profile, email } = req.body;

        // check the existing user
        const existUsername = new Promise((resolve, reject) => {


            UserModel.findOne({ username }, function (err, user) {

                // problem here
                if (err) {
                    reject(new Error(err))
                };
                if (user) {
                    reject({ error: "Please use unique username" })
                };

                resolve();
            });
        });

        // check for existing email

        const existEmail = new Promise((resolve, reject) => {

            UserModel.findOne({ email }, function (err, email) {
                if (err) {
                    reject(new Error(err))
                };
                if (email) {
                    reject({ error: "Please use unique Email" })
                };

                resolve();
            })
        });


        Promise.all([existUsername, existEmail])
            .then(() => {
                if (password) {
                    bcrypt.hash(password, 10)
                        .then(hashedPassword => {

                            const user = new UserModel({
                                username,
                                password: hashedPassword,
                                profile: profile || '',
                                email
                            });

                            // return save result as a response
                            user.save()
                                .then(result => res.status(201).send({ msg: "User Register Successfully" }))
                                .catch(error => res.status(500).send({ error }))

                        }).catch(error => {
                            return res.status(500).send({
                                msg: "Enable to hashed password"
                            })
                        })
                }
            }).catch(error => {
                return res.status(500).send({ error })
            })


    } catch (error) {
        return res.status(500).send({ error });
    }

}

/**login-post */
export async function login(req, res) {
    const { username, password } = req.body;
    try {
        UserModel.findOne({ username })
            .then(user => {
                bcrypt.compare(password, user.password)
                    .then(passwordCheck => {
                        if (!passwordCheck) return res.status(400).send({ error: "dont have password" });

                        const token = jwt.sign({
                            userId: user._id,
                            username: user.username
                        }, ENV.Jwt_secret, { expiresIn: "24h" });

                        return res.status(200).send({
                            msg: "login success..!",
                            username: user.username,
                            token
                        })
                    })
                    .catch(error => {
                        return res.status(400).send({ error: "password not match" })
                    })
            })
            .catch(error => {
                res.status(404).send({ error: 'username not found' });
            })
    } catch (error) {
        return res.status(500).send({ error });

    }


}

/**getuser-post */
export async function getUser(req, res) {
    const { username } = req.params;


    try {
        if (!username) return res.status(501).send({ error: "Invalid username" });
        UserModel.findOne({ username }, function (err, user) {
            if (err) return res.status(500).send({ err });
            if (!user) return res.status(501).send({ error: "no user data found" });

            const { password, ...rest } = Object.assign({}, user.toJSON());

            return res.status(201).send(rest);
        })
    } catch (error) {
        return res.status(404).send({ error: "cannot find user" })
    }
}

export async function updateUser(req, res) {
    res.json('updateuser route');
}

export async function generateOTP(req, res) {
    res.json('generateOTP route');
}

export async function verifyOTP(req, res) {
    res.json('verifyOTP route');
}

export async function createResetSession(req, res) {
    res.json('createResetSession route');
}

export async function resetPassword(req, res) {
    res.json('resetPassword route');
}