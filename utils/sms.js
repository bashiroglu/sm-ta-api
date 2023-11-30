const axios = require("axios");

exports.sendSmsRequest = async (number, text) => {
  const login = process.env.SMS_LOGIN;
  const key = process.env.SMS_API_KEY;
  const sender = process.env.SMS_SENDER;
  try {
    const result = await axios.post(
      "https://sms.atltech.az:8090/index.php?app=json_api_send",
      {
        login,
        key,
        sender,
        scheduled: "NOW",
        text: text,
        msisdn: number,
        unicode: false,
      }
    );
    return result;
  } catch (error) {
    console.error(error);
  }
};
