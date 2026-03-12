import http from "k6/http";
import { check, sleep } from "k6";

const BASE_URL = "http://localhost:30080";
const TARGET_PATH = __ENV.TARGET_PATH || "/video-processing-jobs";
const AUTH_TOKEN = __ENV.AUTH_TOKEN;

export const options = {
  stages: [
    { duration: "30s", target: 10 },
    { duration: "1m", target: 25 },
    { duration: "1m", target: 50 },
    { duration: "1m", target: 100 },
    { duration: "30s", target: 0 },
  ],
  thresholds: {
    http_req_failed: ["rate<0.02"],
  },
};

export default function () {
  // const headers = AUTH_TOKEN ? { Authorization: `Bearer ${AUTH_TOKEN}` } : {};
  const res = http.get(`${BASE_URL}${TARGET_PATH}`);

  check(res, {
    "status 200": (r) => r.status === 200,
    "tempo < 1s": (r) => r.timings.duration < 1000,
    "retorna array": (r) => {
      try {
        const payload = JSON.parse(r.body as string);
        return Array.isArray(payload);
      } catch {
        return false;
      }
    },
  });

  sleep(1);
}
