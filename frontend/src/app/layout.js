import Providers from "./providers";
import "./globals.scss";

export const metadata = {
  title: "QGen Studio",
  description: "An Adaptive Question-Answer Generation, Training and Evaluation Platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
          <Providers>{children}</Providers>
      </body>
    </html>
  );
}
