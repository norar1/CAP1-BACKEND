import express from "express";
import {
  CreatePermit,
  GetPermit,
  UpdatePermit,
  DeletePermit,
  SearchPermits,
  UpdateStatus,
  UpdateBusinessPaymentStatus,
  UpdateOccupancyPaymentStatus,
  GetPermitsByBusinessPaymentStatus,
  GetPermitsByOccupancyPaymentStatus,
  GetPermitsByStatus,
} from "../controller/Business-Occupancy.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.post("/CreatePermit", auth, CreatePermit);

router.get("/GetPermit", GetPermit);

router.put("/UpdatePermit/:id", UpdatePermit);

router.delete("/DeletePermit/:id", DeletePermit);

router.get("/search", SearchPermits);

router.put("/UpdateStatus/:id", UpdateStatus);

router.put("/UpdateBusinessPaymentStatus/:id", UpdateBusinessPaymentStatus);

router.put("/UpdateOccupancyPaymentStatus/:id", UpdateOccupancyPaymentStatus);

router.get("/GetPermitsByBusinessPaymentStatus/:payment_status_business", GetPermitsByBusinessPaymentStatus);

router.get("/GetPermitsByOccupancyPaymentStatus/:payment_status_occupancy", GetPermitsByOccupancyPaymentStatus);

router.get("/GetPermitsByStatus/:status", GetPermitsByStatus);

export default router;