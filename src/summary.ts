import { client } from "./honoClient";

// Function to format date as "21st Oct 2023"
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.toLocaleString('default', { month: 'short' });
  const year = date.getFullYear();
  const daySuffix = (day === 1 || day === 21 || day === 31) ? 'st' :
    (day === 2 || day === 22) ? 'nd' :
      (day === 3 || day === 23) ? 'rd' : 'th';
  return `${day}${daySuffix} ${month} ${year}`;
};

// Hardcoded dates and arbitrary summary points
const summaries = [
  {
    date: "2023-10-01",
    summary: [
      "Discussed project timelines and deliverables.",
      "Reviewed design mockups and provided feedback.",
      "Brainstormed ideas for the new marketing campaign.",
      "Finalized the budget for Q4."
    ]
  },
  {
    date: "2023-10-02",
    summary: [
      "Prepared for the client presentation.",
      "Conducted team training on new software."
    ]
  },
  {
    date: "2023-10-03",
    summary: [
      "Wrapped up the week with a team meeting.",
      "Discussed project timelines and deliverables.",
      "Reviewed design mockups and provided feedback.",
      "Brainstormed ideas for the new marketing campaign.",
      "Finalized the budget for Q4."
    ]
  },
  {
    date: "2023-10-04",
    summary: [
      "Prepared for the client presentation.",
      "Conducted team training on new software.",
      "Wrapped up the week with a team meeting."
    ]
  },
  {
    date: "2023-10-05",
    summary: [
      "Discussed project timelines and deliverables.",
      "Reviewed design mockups and provided feedback."
    ]
  },
  {
    date: "2023-10-06",
    summary: [
      "Brainstormed ideas for the new marketing campaign.",
      "Finalized the budget for Q4.",
      "Prepared for the client presentation.",
      "Conducted team training on new software."
    ]
  },
  {
    date: "2023-10-07",
    summary: [
      "Wrapped up the week with a team meeting."
    ]
  }
];

const result = await client.api.summary.$get();
console.log(result);
if (!result.ok) {
  throw new Error("Failed to fetch summaries");
}

console.log(await result.json())

const cardContainer = document.getElementById("card-container");

// Generate cards dynamically
summaries.forEach(day => {
  const card = document.createElement("div");
  card.classList.add("card", "rounded-lg", "shadow-md", "p-6", "w-80", "transition-transform", "hover:transform", "hover:-translate-y-2", "theme-transition");
  card.style.backgroundColor = "var(--surface0)";
  card.style.color = "var(--text)";

  const dateHeading = document.createElement("h3");
  dateHeading.classList.add("text-lg", "font-semibold", "mb-4");
  dateHeading.style.color = "var(--text)";
  dateHeading.textContent = formatDate(day.date); // Format the date

  const summaryList = document.createElement("ul");
  summaryList.classList.add("list-disc", "pl-6", "space-y-2");
  day.summary.forEach(point => {
    const listItem = document.createElement("li");
    listItem.classList.add("text-sm");
    listItem.style.color = "var(--text)";
    listItem.textContent = point;
    summaryList.appendChild(listItem);
  });

  card.appendChild(dateHeading);
  card.appendChild(summaryList);
  cardContainer?.appendChild(card);
});