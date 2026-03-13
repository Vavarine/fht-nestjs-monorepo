import http from "k6/http";
import { check, sleep } from "k6";

const BASE_URL = __ENV.LOAD_TEST_BASE_URL || "http://localhost:30080";
const TARGET_PATH = __ENV.TARGET_PATH || "/video-processing-jobs";
const AUTH_TOKEN = __ENV.AUTH_TOKEN;
const FILE_NAME = __ENV.FILE_NAME || "exemple.mp4";
const FILE_MIME_TYPE = __ENV.FILE_MIME_TYPE || "video/mp4";
const VIDEO_FILE_PATH = __ENV.VIDEO_FILE_PATH;

export const options = {
  stages: [{ duration: "30s", target: 10 }],
  thresholds: {
    http_req_failed: ["rate<0.02"],
  },
};

function loadLocalFile(): string | ArrayBuffer {
  const candidatePaths = [
    VIDEO_FILE_PATH,
    "k6/exemple.mp4",
    "./k6/exemple.mp4",
    "./exemple.mp4",
    "/scripts/exemple.mp4",
  ].filter(Boolean) as string[];

  for (const path of candidatePaths) {
    try {
      return open(path, "b");
    } catch (_) {
      // tenta proximo caminho
    }
  }

  throw new Error(
    `Arquivo de video nao encontrado. Tentativas: ${candidatePaths.join(", ")}`,
  );
}

const FILE_BYTES = loadLocalFile();

export default function () {
  const body = {
    name: `video-job-${__VU}-${__ITER}`,
    file: http.file(FILE_BYTES, FILE_NAME, FILE_MIME_TYPE),
  };

  console.log("token", AUTH_TOKEN);

  const headers = AUTH_TOKEN
    ? { Authorization: `Bearer ${AUTH_TOKEN}` }
    : ({} as Record<string, string>);

  const res = http.post(`${BASE_URL}${TARGET_PATH}`, body, { headers });

  check(res, {
    "status 2xx": (r) => r.status >= 200 && r.status < 300,
    "tempo < 2s": (r) => r.timings.duration < 2000,
  });

  sleep(1);
}
