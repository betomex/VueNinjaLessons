const API_KEY =
  "be3858a6042012d5ba90160a7f2893635e48c5fbe3834e15ec4b5c3d8e5765ce";

const tickersHandlers = new Map();
const socket = new WebSocket(
  `wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`
);
const AGGREGATE_INDEX = "5";

socket.addEventListener("message", (response) => {
  const {
    TYPE: type,
    FROMSYMBOL: currency,
    PRICE: newPrice,
  } = JSON.parse(response.data);

  if (type !== AGGREGATE_INDEX || newPrice === undefined) return;

  const handlers = tickersHandlers.get(currency) || [];
  handlers.forEach((fn) => fn(newPrice));
});

const sendMessage = (message) => {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(message));
    return;
  }

  socket.addEventListener(
    "open",
    () => {
      socket.send(JSON.stringify(message));
    },
    { once: true }
  );
};

export const subscribeToUpdates = (ticker, callback) => {
  const subscribers = tickersHandlers.get(ticker) || [];
  tickersHandlers.set(ticker, [...subscribers, callback]);

  sendMessage({
    action: "SubAdd",
    subs: [`5~CCCAGG~${ticker}~USD`],
  });
};

export const unsubscribeFromUpdates = (ticker) => {
  tickersHandlers.delete(ticker);

  sendMessage({
    action: "SubRemove",
    subs: [`5~CCCAGG~${ticker}~USD`],
  });
};
