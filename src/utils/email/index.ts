import { SendEmailCommand } from "@aws-sdk/client-ses";

type TCreateSendEmailCommandProps = {
  fromAddress: string;
  toAddresses: string[];
  bodyHtml: string;
  subject: string;
  //
  replyToAddresses?: string[];
  ccAddresses?: string[];
};

// Returns a command that can be used as follows:
/*
  const sendEmailCommand = createSendEmailCommand(
    "recipient@example.com",
    "sender@example.com",
  );

  try {
    // HERE
    return await sesClient.send(sendEmailCommand);
  } catch (e) {
    console.error("Failed to send email.");
    return e;
  }
*/
export const createSendEmailCommand = ({
  fromAddress,
  toAddresses,
  ccAddresses,
  replyToAddresses,
  bodyHtml,
  subject,
}: TCreateSendEmailCommandProps) => {
  return new SendEmailCommand({
    Destination: {
      CcAddresses: ccAddresses,
      ToAddresses: toAddresses,
    },
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: bodyHtml,
        },
        Text: {
          Charset: "UTF-8",
          Data: bodyHtml,
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: subject,
      },
    },
    Source: fromAddress,
    ReplyToAddresses: replyToAddresses,
  });
};
