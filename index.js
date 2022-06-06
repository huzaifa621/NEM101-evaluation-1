const fs = require("fs");
const express = require("express");
const crypto = require("crypto");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.post("/user/create", (req, res) => {
    fs.readFile("./db.json", { encoding: 'utf-8' }, (err, data) => {
        res.setHeader("content-type", "application/json");
        let parsedData = JSON.parse(data);
        let newId = parsedData.users.length + 1;
        const body = { id: newId, ...req.body };
        parsedData.users = [...parsedData.users, body];
        fs.writeFile("./db.json", JSON.stringify(parsedData), { encoding: 'utf-8' }, (err) => {
            if (err) throw err;
            res.status(201).send({ status: "user created", id: newId });
        })
    })
})

app.post("/user/login", (req, res) => {
    const body = req.body;
    if (body["username"] === "" || body["password"] === "" || body == {}) {
        return res.status(400).send({ status: "please provide username and password" });
    }

    fs.readFile("./db.json", { encoding: 'utf-8' }, (err, data) => {
        res.setHeader("content-type", "application/json");
        if (err) throw err;
        let parsedData = JSON.parse(data);
        for (let i = 0; i < parsedData.users.length; i++) {
            if (parsedData.users[i].username == body.username && parsedData.users[i].password == body.password) {

                const token = crypto.randomInt(0, 100000);
                parsedData.users = parsedData.users.map((el) => el.username == body.username ? ({ ...el, token: token }) : el);
                return fs.writeFile("./db.json", JSON.stringify(parsedData), { encoding: 'utf-8' }, (err) => {
                    if (err) throw err;
                    return res.send({ status: "Login Successful", token });
                })

            }
        }
        res.status(401).send({ status: "Invalid Credentials" });
    })
})

app.post("/user/logout", (req, res) => {
    const body = req.body;
    if (body["username"] === "" || body["password"] === "" || body == {}) {
        return res.status(400).send({ status: "please provide username and password" });
    }

    fs.readFile("./db.json", { encoding: 'utf-8' }, (err, data) => {
        function deleteToken(el) {
            let { name, role, age, username, password, id } = el;
            return ({
                id,
                name,
                age,
                role,
                username,
                password
            })
        }
        res.setHeader("content-type", "application/json");
        if (err) throw err;
        let parsedData = JSON.parse(data);
        for (let i = 0; i < parsedData.users.length; i++) {
            if (parsedData.users[i].username == body.username && parsedData.users[i].password == body.password) {

                parsedData.users = parsedData.users.map((el) => el.username == body.username ? deleteToken(el) : el);
                return fs.writeFile("./db.json", JSON.stringify(parsedData), { encoding: 'utf-8' }, (err) => {
                    if (err) throw err;
                    return res.send({ status: "user logged out successfully" });
                })

            }
        }
        res.status(401).send({ status: "Invalid Credentials" });
    })
})

app.get("/votes/party/:party", (req, res) => {
    fs.readFile("./db.json", { encoding: 'utf-8' }, (err, data) => {
        const { party } = req.params;
        let parsedData = JSON.parse(data);
        const ans = parsedData.users.filter((el) => el.party == party);
        res.send(ans);
    })
})

app.get("/votes/voters", (req, res) => {
    fs.readFile("./db.json", { encoding: 'utf-8' }, (err, data) => {
        let parsedData = JSON.parse(data);
        const ans = parsedData.users.filter((el) => el.role == "voter");
        res.send(ans);
    })
})

app.post("/votes/vote/:user", (req, res) => {
    fs.readFile("./db.json", { encoding: 'utf-8' }, (err, data) => {
        if (err) throw err;
        const { user } = req.params;
        let parsedData = JSON.parse(data);
        parsedData.users = parsedData.users.map((el) => el.name == user ? ({ ...el, votes: el.votes + 1 }) : el);
        fs.writeFile("./db.json", JSON.stringify(parsedData), { encoding: 'utf-8' }, (err) => {
            if (err) throw err;
            res.send("votes updated!")
        })
    })
})

app.get("/votes/count/:user", (req, res) => {
    fs.readFile("./db.json", { encoding: 'utf-8' }, (err, data) => {
        if (err) throw err;
        const { user } = req.params;
        let parsedData = JSON.parse(data);
        let ans = parsedData.users.filter((el) => el.name == user);
        if (ans.length>0) {
            return res.send({ status: ans[0].votes })
        }
        else {
            return res.send({ status: "cannot find user" })
        }
    })
})

const PORT = process.env.PORT || 8080

app.listen(PORT)
