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
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;

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
      return res
        .status(400)
        .send({
          status: "error",
          message: `Invalid LinkedIn access token`,
          firebaseToken: null,
        });
    }

    const customToken = await admin.auth().createCustomToken(linkedInUID);
    res.send({
      status: "success",
      message: "Success",
      firebaseToken: customToken,
    });
  } catch (error) {
    res
      .status(500)
      .send({
        status: "error",
        message: `Error generating custom token | ${error}`,
        firebaseToken: null,
      });
  }
});

module.exports = router;
