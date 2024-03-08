import { describe, test } from "bun:test";
import { uploadToCloudStorage } from "../src/app";

describe("aaaa", async () => {
    test("output and input match", async () => {
        const inputArray = new Uint8Array([1, 2, 3, 4, 5]);

        const readableStream = new ReadableStream({
            start(controller) {
                controller.enqueue(inputArray);
                controller.close();
            },
        });

        uploadToCloudStorage({
            body: readableStream,
            fileName: "test.mp4",
            contentType: "video/mp4",
        });
    });
});
