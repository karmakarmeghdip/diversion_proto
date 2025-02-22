import { createAuthClient } from "better-auth/client";

const authClient = createAuthClient();

export async function signin() {
  const data = await authClient.signIn.social({
    provider: "google"
  });
  console.log(data);
}

for (const el of document.getElementsByClassName("google"))
  el.addEventListener("click", signin);


authClient.useSession.subscribe((v) => {
  console.log(v);
  if (v.data) {
    for (const el of document.getElementsByClassName("userin"))
      el.classList.add("hidden");
    for (const el of document.getElementsByClassName("userout"))
      el.classList.remove("hidden");
    (document.getElementById("profileimg") as HTMLImageElement).src = v.data.user.image || "/assests/user.png";
  } else {
    for (const el of document.getElementsByClassName("userin"))
      el.classList.remove("hidden");

    for (const el of document.getElementsByClassName("userout"))
      el.classList.add("hidden");

  }
});