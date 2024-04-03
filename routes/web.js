import express from "express";
import { logo } from "../src/common/helper";
import { baseUrl } from "../src/common/config/constant.config";

const router = express.Router();

router.get("/api/changelogs", (req, res) => {
  return res.render("api/changelogs", { logo: logo(), baseUrl: baseUrl() });
});

router.get("/chat/changelogs", (req, res) => {
  return res.render("chat/changelogs", { logo: logo(), baseUrl: baseUrl() });
});

router.get("/api/changelogs", (req, res) => {
  return res.render("api/changelogs", { logo: logo(), baseUrl: baseUrl() });
});

router.get("/chat", (req, res) => {
  return res.render("chat/");
});

module.exports = router;
