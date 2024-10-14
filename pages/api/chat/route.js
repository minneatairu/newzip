import { NextResponse } from "next/server";
import sharp from "sharp";

const API_HOST = process.env.REPLICATE_API_HOST || "https://api.replicate.com";

export async function GET(req, { params }) {
  try {
    const id = params.id;
    const response = await fetch(`${API_HOST}/v1/predictions/${id}`, {
      headers: {
        Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    if (response.status !== 200) {
      const error = await response.json();
      return NextResponse.json({ detail: error.detail }, { status: 500 });
    }

    const prediction = await response.json();
    console.log("Prediction status:", prediction.status);

    if (prediction.status !== "succeeded") {
      // If the prediction is not yet complete, return its status
      return NextResponse.json({ status: prediction.status });
    }

    // If the prediction is complete, process the image
    const imageUrl = prediction.output[0];
    console.log("Image URL:", imageUrl);

    const imageResponse = await fetch(imageUrl);
    const imageBuffer = await imageResponse.arrayBuffer();

    // Add text overlay using Sharp
    const overlayText = "Sample Overlay Text";

    const modifiedBuffer = await sharp(Buffer.from(imageBuffer))
      .composite([
        {
          input: Buffer.from(
            `<svg>
              <text x="10" y="50" font-size="30" fill="white">${overlayText}</text>
            </svg>`
          ),
          gravity: "southeast",
        },
      ])
      .toBuffer();

    // Return the processed image
    return new Response(modifiedBuffer, {
      status: 200,
      headers: { "Content-Type": "image/png" },
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { detail: "Internal Server Error" },
      { status: 500 }
    );
  }
}
