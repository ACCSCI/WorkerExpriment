// worker.js
//告诉worker如何处理主线程发来的消息
self.onmessage = function(e) {
    const data = e.data;
    // 执行一些计算密集型的任务
    const result = performHeavyComputation(data);
    // 将结果发送回主线程
    self.postMessage(result);
};

function performHeavyComputation(data) {
    let result = 0;
    for (let i = 0; i < data; i++) {
    result += Math.sqrt(i);
    }
    return result;
}
