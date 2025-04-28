export function log(msg: string, data: unknown = undefined) {
  const date = new Date().toLocaleString();
  const message = `🕒 ${date} | ${msg}`;
  console.log(message);
  if (data) {
    console.log("📫 Data:");
    console.log(data);
    console.log("📪 Data end");
  }
}

export function error(msg: string, error: unknown | undefined = undefined) {
  const date = new Date().toLocaleString();
  const message = `🕒 ${date} | ${msg}`;
  console.error(message);
  if (error) {
    console.log("📫 Data:");
    console.error(error);
    console.log("📪 Data end");
  }
}
