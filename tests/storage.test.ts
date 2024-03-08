import { describe, expect, test } from "bun:test";
import { mock, jest } from "bun:test";
import stream from "node:stream";

describe("storage", async () => {
    let outputStreamArray = new Uint8Array(0);

    const mockedFile = jest.fn(() => ({
        createWriteStream: jest.fn().mockImplementation(() => {
            const mockStream = new stream.Writable();
            console.log("THE MOCK ACTUALLY WORKS!");

            mockStream._write = (chunk, encoding, done) => {
                const chunkUint8 = new Uint8Array(chunk);
                const tmp = new Uint8Array(outputStreamArray.byteLength + chunkUint8.byteLength);

                tmp.set(outputStreamArray, 0);
                tmp.set(chunkUint8, outputStreamArray.byteLength);

                outputStreamArray = tmp;

                done();
            };

            return mockStream;
        }),
    }));

    const mockedStorage = {
        bucket: jest.fn(() => ({
            file: mockedFile,
        })),
    };

    mock.module("@google-cloud/storage", () => {
        console.log("THE MOCK HAS BEEN INITIALIZED");

        return {
            Storage: jest.fn(() => mockedStorage),
        };
    });

    const { uploadToCloudStorage } = await import("../src/app");

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

        expect(outputStreamArray.length).toBe(inputArray.length);
    });
});
