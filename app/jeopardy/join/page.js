import Image from "next/image";

const joinUrl = "https://basir-noor.vercel.app/jeopardy";

export const metadata = {
  title: "Join Islamic Jeopardy",
  description: "Scan the QR code to join Islamic Jeopardy.",
};

export default function JeopardyJoinPage() {
  return (
    <section className="jeopardy-join-page">
      <div className="jeopardy-join-flower jeopardy-join-flower--one" aria-hidden="true">✿</div>
      <div className="jeopardy-join-flower jeopardy-join-flower--two" aria-hidden="true">✿</div>
      <div className="jeopardy-join-flower jeopardy-join-flower--three" aria-hidden="true">✿</div>

      <div className="jeopardy-join-copy">
        <p className="jeopardy-join-eyebrow">EVENT NIGHT · PLAY ALONG</p>
        <h1>
          Join Islamic <em>Jeopardy!</em>
        </h1>
        <p className="jeopardy-join-lede">
          Scan the code with your phone, choose your team, and get ready to buzz in.
        </p>
        <ol className="jeopardy-join-steps">
          <li><span>1</span> Open your phone&apos;s camera</li>
          <li><span>2</span> Point it at the QR code</li>
          <li><span>3</span> Tap the link to join</li>
        </ol>
      </div>

      <div className="jeopardy-join-qr-card">
        <a href={joinUrl} aria-label="Open the Islamic Jeopardy game">
          <Image
            src="/images/jeopardy-join-qr.svg"
            alt="QR code linking to the Islamic Jeopardy game"
            width={1200}
            height={1200}
            priority
          />
        </a>
        <p>SCAN TO JOIN</p>
        <a className="jeopardy-join-url" href={joinUrl}>{joinUrl.replace("https://", "")}</a>
      </div>
    </section>
  );
}
