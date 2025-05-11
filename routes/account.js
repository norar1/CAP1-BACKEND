import express from 'express';
import {CreateAcc, GetAcc, UdpateAcc, DeleteAcc, LoginAcc} from "../controller/Account.js"

const router = express.Router();

router.post('/createAcc', CreateAcc);

router.get('/getAcc', GetAcc);

router.put("/updateAcc/:id", UdpateAcc);

router.delete("/deleteAcc/:id", DeleteAcc);

router.post("/login", LoginAcc);

export default router;