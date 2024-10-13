// 主线程中的代码
if (window.Worker) {
    // 创建一个新的Worker
    const myWorker = new Worker('/static/js/worker.js');//到时候这里动态生成url，用模板传递

    // 当Worker发送消息回来时，执行此函数
    myWorker.onmessage = function(e) {
    console.log('Received message from worker: ', e.data);
    // 可以在这里处理结果
    };

    // 向Worker发送消息
    myWorker.postMessage(1000000); // 假设我们发送一个数字，用于计算

    // 如果需要，可以终止Worker
    // myWorker.terminate();
} else {
    console.log('Your browser doesn\'t support web workers.');
}
