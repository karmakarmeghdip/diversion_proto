import { createAuthClient } from "better-auth/client";

export const authClient = createAuthClient();

export async function signin() {
  const data = await authClient.signIn.social({
    provider: "google"
  });
  console.log(data);
}

document.getElementById("google")?.addEventListener("click", signin);

document.getElementById("signout")?.addEventListener("click", async () => {
  const res = await authClient.signOut({
    fetchOptions: {
      onSuccess: () => {
        console.log("Signed out");
        window.location.href = "/signup";
      }
    }
  });
  console.log(res);
});


let timer: Timer;
authClient.useSession.subscribe((v) => {
  console.log(v);
  if (v.data) {
    for (const el of document.getElementsByClassName("userin"))
      el.classList.add("hidden");
    for (const el of document.getElementsByClassName("userout"))
      el.classList.remove("hidden");
    const profileimg = document.getElementById("profileimg");
    if (profileimg)
      (profileimg as HTMLImageElement).src = v.data.user.image || "/assests/user.png";
    if (timer) {
      clearTimeout(timer)
    };
  } else {
    for (const el of document.getElementsByClassName("userin"))
      el.classList.remove("hidden");

    for (const el of document.getElementsByClassName("userout"))
      el.classList.add("hidden");
    if (window.location.pathname !== '/signup' && !v.isPending) {
      timer = setTimeout(() => {
        window.location.href = "/signup";
      }, 2000)
    }
  }
});