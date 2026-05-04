import cluster from "node:cluster";
import os from "node:os";
import process from "node:process";

if (cluster.isPrimary) {
	console.log(
		`Available cores: ${os.availableParallelism()}. Creating ${os.availableParallelism()} cores :D`
	);
	for (let i = 0; i < os.availableParallelism(); i++) cluster.fork();
} else {
	await import("./server");
	console.log(`Worker ${process.pid} started`);
}

// stolen from big elysia
