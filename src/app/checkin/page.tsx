import { cookies } from "next/headers";
import { CheckinClient } from "./CheckinClient";
import { CheckinLogin } from "./CheckinLogin";
import { isCheckinAuthenticated } from "@/lib/checkinAuth";

export default function CheckinPage() {
  const session = cookies().get("checkin_session")?.value;

  if (!isCheckinAuthenticated(session)) {
    return <CheckinLogin />;
  }

  return <CheckinClient />;
}
