var express = require("express");
var router = express.Router();
const admin = require("firebase-admin");
const axios = require("axios");

router.post("/", async (req, res) => {
  const linkedInAccessToken = req.body.accessToken;
  const linkedInUID = req.body.uid;

  console.log(`token : ${linkedInAccessToken}`);
  console.log(`uid : ${linkedInUID}`);

  // Validate the LinkedIn access token
  const clientId = "77pv0j45iro4cd"; // Replace with your actual client ID
  const clientSecret = "LQKSW66VfAIrulyQ"; // Replace with your actual client secret

  try {
    const validationResponse = await axios.post(
      "https://www.linkedin.com/oauth/v2/introspectToken",
      new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        token: linkedInAccessToken,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const validationData = validationResponse.data;
    console.log(validationData);

    if (!validationData.active) {
      return res.status(400).send({ error: "Invalid LinkedIn access token" });
    }

    const customToken = await admin.auth().createCustomToken(linkedInUID);
    res.send({ firebaseToken: customToken });
  } catch (error) {
    res.status(500).send({ error: `Error generating custom token | ${error}` });
  }
});

module.exports = router;
