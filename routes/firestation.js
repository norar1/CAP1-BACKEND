import express from "express";
import {
  CreatePermit,
  GetPermit,
  UpdatePermit,
  DeletePermit,
  SearchPermits,
} from "../controller/Bussiess-occupancy.js"

const router = express.Router();

router.post("/CreatePermit", CreatePermit);

router.get("/GetPermit", GetPermit);

router.put("/UpdatePermit/:id", UpdatePermit);

router.delete("/DeletePermit/:id", DeletePermit);

router.get('/search', SearchPermits);

export default router;
