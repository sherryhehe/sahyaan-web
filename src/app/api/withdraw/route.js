// app/api/withdraw/route.js
import { NextResponse } from "next/server";
import { db } from "@/firebase/firebase";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  arrayUnion,
} from "firebase/firestore";
import nodemailer from "nodemailer";
// import { fetchOrder } from "@/app/(dashboard)/dashboard/fetch";
import { fetchOrders } from "@/app/(dashboard)/order/fetch";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_FROM_EMAIL,
    pass: process.env.SMTP_PASS,
  },
});

async function sendWithdrawalEmail(
  email,
  amount,
  currency,
  referenceId,
  sellerName,
) {
  const mailOptions = {
    from: process.env.SMTP_FROM_EMAIL,
    to: email,
    subject: "Withdrawal Request Received",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Withdrawal Request Confirmation</h1>
        <p>Dear ${sellerName},</p>
        <p>We have received your withdrawal request with the following details:</p>
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Amount:</strong> ${amount.toLocaleString("en-US", {
            style: "currency",
            currency: currency,
          })}</p>
          <p><strong>Reference ID:</strong> ${referenceId}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
        </div>
        <p>Your withdrawal is being processed and you will receive another email once it has been completed.</p>
        <p>If you have any questions, please contact our support team.</p>
        <p>Best regards,<br>Your Platform Team</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}

async function sendAdminNotification(sellerData, withdrawalDetails) {
  const adminMailOptions = {
    from: process.env.SMTP_FROM_EMAIL,
    to: process.env.ADMIN_EMAIL, // Make sure to set this in your environment variables
    subject: "New Withdrawal Request",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">New Withdrawal Request</h1>
        <h2>Seller Information</h2>
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Name:</strong> ${sellerData.name}</p>
          <p><strong>Email:</strong> ${sellerData.email}</p>
          <p><strong>Seller ID:</strong> ${sellerData.id}</p>
          <p><strong>Phone:</strong> ${sellerData.phone || "Not provided"}</p>
        </div>

        <h2>Bank Information</h2>
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Bank Name:</strong> ${
            sellerData.bankInfo?.bankName || "Not provided"
          }</p>
          <p><strong>Account Number:</strong> ${
            sellerData.bankInfo?.accountNumber || "Not provided"
          }</p>
          <p><strong>Account Holder:</strong> ${
            sellerData.bankInfo?.accountHolder || "Not provided"
          }</p>
          <p><strong>SWIFT/BIC:</strong> ${
            sellerData.bankInfo?.swiftCode || "Not provided"
          }</p>
          <p><strong>IBAN:</strong> ${
            sellerData.bankInfo?.iban || "Not provided"
          }</p>
          <p><strong>Bank Address:</strong> ${
            sellerData.bankInfo?.bankAddress || "Not provided"
          }</p>
        </div>

        <h2>Withdrawal Details</h2>
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Amount:</strong> ${withdrawalDetails.amount.toLocaleString(
            "en-US",
            {
              style: "currency",
              currency: withdrawalDetails.currency,
            },
          )}</p>
          <p><strong>Reference ID:</strong> ${withdrawalDetails.referenceId}</p>
          <p><strong>Date:</strong> ${new Date(
            withdrawalDetails.date,
          ).toLocaleString()}</p>
          <p><strong>Status:</strong> ${withdrawalDetails.status}</p>
        </div>

        <h2>Account Statistics</h2>
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Total Revenue:</strong> ${sellerData.revenue.toLocaleString(
            "en-US",
            {
              style: "currency",
              currency: withdrawalDetails.currency,
            },
          )}</p>
          <p><strong>Previous Withdrawals:</strong> ${
            sellerData.totalWithdrawals || 0
          }</p>
        </div>

        <div style="margin-top: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 5px;">
          <p><strong>Action Required:</strong> Please process this withdrawal request and update the status in the admin dashboard.</p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(adminMailOptions);
}

export async function POST(request) {
  try {
    const { sellerId, amount, currency, email, sellerName } =
      await request.json();

    // Generate a unique reference ID
    const referenceId = `WD-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // Get complete seller information
    const sellerRef = doc(db, "seller", sellerId);
    const sellerDoc = await getDoc(sellerRef);
    const sellerData = sellerDoc.data();
    const withdrawalDetails = {
      sellerId,
      amount,
      currency,
      date: new Date().toISOString(),
      referenceId,
      status: "pending",
    };

    // Add withdrawal record to Firestore
    // const withdrawalRef = await addDoc(
    //   collection(db, "withdrawals"),
    //   withdrawalDetails,
    // );

    // Update seller's balance
    await sendWithdrawalEmail(email, amount, currency, referenceId, sellerName);

    // Send notification email to admin
    await sendAdminNotification(
      {
        ...sellerData,
        id: sellerId,
        email: email,
        name: sellerName,
      },
      withdrawalDetails,
    );
    await updateDoc(sellerRef, {
      revenue: 0,
      debt: 0,
      // totalWithdrawals: (sellerData.totalWithdrawals || 0) + 1,
      withdrawal: arrayUnion(withdrawalDetails),
      lastWithdrawal: {
        amount,
        date: new Date().toISOString(),
        referenceId,
        status: "pending",
      },
    });

    await fetchOrders(sellerId).then((data) =>
      data.map(async (item) => {
        if (item.status === "delivered") {
          // item.status = "finished";
          await updateDoc(doc(db, "orders", item.id), { status: "finished" });
        }
      }),
    );
    // Send confirmation email to seller

    return NextResponse.json({
      success: true,
      referenceId,
      status: "pending",
    });
  } catch (error) {
    console.error("Error processing withdrawal:", error);

    return NextResponse.json(
      {
        error: "Error processing withdrawal",
        message: error.message,
      },
      { status: 500 },
    );
  }
}
