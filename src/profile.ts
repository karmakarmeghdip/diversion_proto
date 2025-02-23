import { authClient } from './authClient';
async function getUserData() {
  const userId = (await authClient.getSession()).data?.user;

  if (!userId) {
    window.location.href = '/signup';
    throw new Error('User is not logged in');
  }

  return { ...userId, streak: "2" };
}

// @ts-ignore
window.getUserD = getUserData;
window.dispatchEvent(new Event('getUserDReady'));
console.log("callback assigned");