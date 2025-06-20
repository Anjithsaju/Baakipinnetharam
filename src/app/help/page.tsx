"use client";
import { useRouter } from "next/navigation";
import Stepper, { Step } from "../Stepper/Stepper";
import Carousel, { CarouselItem } from "../Carousel/Carousel";

const imageItems: CarouselItem[] = [
  {
    id: 1,
    title: "Beautiful ",
    description: "A scenic view of the mountains.",
    image: "/Images/carousel/1.jpg",
  },
  {
    id: 2,
    title: "City Lights",
    description: "Urban vibes at night.",
    image: "/Images/carousel/2.jpg",
  },
  {
    id: 3,
    title: "Ocean Bliss",
    description: "Feel the waves.",
    image: "/Images/carousel/3.jpg",
  },
];
const imageItems2: CarouselItem[] = [
  {
    id: 1,
    title: "Beautiful ",
    description: "A scenic view of the mountains.",
    image: "/Images/carousel/4.jpg",
  },
  {
    id: 2,
    title: "City Lights",
    description: "Urban vibes at night.",
    image: "/Images/carousel/5.jpg",
  },
  {
    id: 3,
    title: "Ocean Bliss",
    description: "Feel the waves.",
    image: "/Images/carousel/6.jpg",
  },
  {
    id: 4,
    title: "Ocean Bliss",
    description: "Feel the waves.",
    image: "/Images/carousel/7.jpg",
  },
  {
    id: 5,
    title: "Ocean Bliss",
    description: "Feel the waves.",
    image: "/Images/carousel/8.jpg",
  },
];
export default function TestPage() {
  const router = useRouter();

  return (
    <div
      className="min-h-screen h-[100vh] flex flex-col items-center p-5 pt-2"
      style={{ background: "linear-gradient(62deg, black, #00206b)" }}
    >
      <h2 className="text-white font-semibold text-[30px] !mt-5 !mb-8">
        Baaki Pinne Tharam
      </h2>
      {/* <p
        style={{
          fontSize: "1.1rem",
          color: "#555",
          marginBottom: "2rem",
        }}
        className="pl-3"
      >
        Here is a quick tour to help you get started with tracking and settling
        expenses seamlessly.
      </p> */}

      <Stepper
        className="m-0"
        initialStep={1}
        onStepChange={(step) => {
          console.log(step);
        }}
        onFinalStepCompleted={() => router.push("/main")}
        backButtonText="Previous"
        nextButtonText="Next"
      >
        <Step>
          <h2>👋 Welcome to Baaki Pinne Tharam!</h2>
          <p>&bull; Manage shared expenses and settle dues effortlessly.</p>
          <p>
            &bull; This quick guide will walk you through the core features.
          </p>
        </Step>

        <Step>
          <h2>✅ Dashboard Overview</h2>
          <p>
            &bull; View your personal expenses, debts, and dues at a glance.
          </p>
          <img src="/images/home.png" className="rounded-2xl " alt="" />
          <p>
            &bull; Balances are synced with others for real-time accuracy.
            Personal expenses remain private.
          </p>
          <p>
            &bull; Use the central navigation panel to explore pages or click on
            any summary card for details.
          </p>
        </Step>

        <Step>
          <h2>💸 Add Expense</h2>
          <p>
            &bull; Click the "+" button to add a personal transaction or due.
          </p>
          <p>
            &bull; For transactions, enter the amount and description. For dues,
            specify the person, amount, and purpose.
          </p>
          <p>
            &bull; Dues appear in your section and in the recipient’s debts.
            Only you can edit or remove them.
          </p>
          <Carousel
            items={imageItems2}
            baseWidth={300}
            autoplay={true}
            autoplayDelay={3000}
            pauseOnHover={true}
            loop={true}
            round={false}
          />
        </Step>
        <Step>
          <h2>🙋‍♂️ Add Members</h2>

          <p>
            &bull; Search for friends and send connection requests via the
            search panel.
          </p>
          <Carousel
            items={imageItems}
            baseWidth={300}
            autoplay={true}
            autoplayDelay={3000}
            pauseOnHover={true}
            loop={true}
            round={false}
          />
          <p>
            &bull; Once accepted, you can assign debts or dues. Messages and
            requests are accessible via the Messages page.
          </p>
        </Step>
        <Step>
          <h2>📜 History & Reports</h2>
          <p>
            &bull; Access a detailed log of your past transactions and
            settlements to avoid confusion.
          </p>
          <h2>🧾 Bills Section</h2>
          <p>
            &bull; Use the Bills page to create, split, and manage shared
            expenses easily.
          </p>
          <h2>⚙️ Profile & Settings</h2>
          <p>
            &bull; Update your name, avatar, theme, and other account
            preferences.
          </p>
          <img src="/Images/carousel/9.jpg" className="rounded-2xl " alt="" />
        </Step>

        <Step>
          <h2>🎉 You’re All Set!</h2>
          <p>
            &bull; Begin managing your finances smartly with Baaki Pinne Tharam.
          </p>

          <p>
            &bull; You can revisit this guide anytime via the “?” icon in the
            navigation panel.
          </p>
        </Step>
      </Stepper>
    </div>
  );
}
