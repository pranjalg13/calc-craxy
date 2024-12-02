import "./createPost.js";

import { Devvit, useState } from "@devvit/public-api";
const DAILY_PUZZLES = [
  { target: 24, numbers: [2, 3, 5, 7, 8, 9], solution: "(8 - 2) * 3 = 24" },
  { target: 120, numbers: [1, 2, 3, 4, 5, 6], solution: "(6 * 5) * 4 = 120" },
  {
    target: 32,
    numbers: [2, 4, 6, 8, 10, 12],
    solution: "(10 - 2) * (8 - 4) = 32",
  },
  {
    target: 25,
    numbers: [1, 2, 3, 4, 5, 6],
    solution: "(6 * 4) + (3 - 2) = 25",
  },
  {
    target: 96,
    numbers: [1, 2, 3, 4, 5, 6],
    solution: "(6 * 5) * 3 + (4 + 2) = 96",
  },
];

// Defines the messages that are exchanged between Devvit and Web View
type WebViewMessage =
  | {
      type: "initialData";
      data: {
        username: string;
        currentPoints: number;
        puzzle: {
          date: string;
          target: number;
          numbers: number[];
          solution: string;
        };
        isPlayed: boolean;
        attempts: number;
      };
    }
  | {
      type: "setPoints";
      data: { newPoints: number };
    }
  | {
      type: "updateGameState";
      data: {
        isPlayed: boolean;
        attempts: number;
      };
    }
  | {
      type: "returnToMain";
    };

Devvit.configure({
  redditAPI: true,
  redis: true,
});

type LeaderboardRow = {
  username: string;
  score: number;
};

type MainPageProps = {
  username: string;
  points: LeaderboardRow[];
  onShowWebviewClick: Function;
};

const MainPage = ({ username, points, onShowWebviewClick }: MainPageProps) => {
  return (
    <vstack alignment="middle center" width="100%" height="100%" gap="large">
      {/* Add Logo Image */}
      <image
        url="logo.png"
        imageHeight="157px"
        imageWidth="1057px"
        width="400px"
        height="60px"
        description="Numblet Logo"
      />
      {/* Main Content */}
      <vstack gap="medium" alignment="middle center" width="80%">
        {/* Leaderboard Section */}
        <vstack
          gap="small"
          alignment="middle center"
          backgroundColor="transparent"
          padding="medium"
          cornerRadius="medium"
          width="100%"
        >
          <text size="xlarge" weight="bold">
            Leaderboard
          </text>
          <text size="medium" color="#ffff00">
            [First 5 solvers earn leaderboard bragging rights!]
          </text>
          {points.map((x, placing) => (
            <hstack
              key={placing.toString()}
              width="100%"
              alignment="middle center"
              backgroundColor="#2A2A2A"
              padding="small"
              cornerRadius="small"
            >
              <text size="large">{placing + 1}.</text>
              <text size="large" weight="bold" color="#4CAF50">
                &nbsp;{x.username}
              </text>
              <spacer />
            </hstack>
          ))}
        </vstack>

        {/* Play Button */}
        <button
          onPress={async () => await onShowWebviewClick()}
          appearance="success"
          size="large"
        >
          Let's Play || {username} ||
        </button>
      </vstack>
    </vstack>
  );
};

type WebViewPageProps = {
  onMessage: Function;
};

const WebViewPage = ({ onMessage }: WebViewPageProps) => {
  return (
    <vstack grow width="100%" height="100%">
      <vstack border="thick" borderColor="black" height="100%">
        <webview
          id="myWebView"
          url="page.html"
          onMessage={(msg) => onMessage(msg as WebViewMessage)}
          grow
          height="100%"
        />
      </vstack>
    </vstack>
  );
};

// Add a custom post type to Devvit
Devvit.addCustomPostType({
  name: "Math Game",
  height: "tall",
  render: (context) => {
    const isMobile = (context.dimensions?.width ?? 500) < 500;
    
    if (isMobile) {
      return (
        <vstack alignment="top center" padding="medium">
          <text size="large" weight="bold" color="#FF4444">
            Please use desktop mode to play this game
          </text>
        </vstack>
      );
    }

    // Load username with `useAsync` hook
    const [username] = useState(async () => {
      const currUser = await context.reddit.getCurrentUser();
      const username = currUser?.username ?? "Guest";
      return username;
    });

    // Load points from redis
    async function getPoints() {
      const result = await context.redis.zScan(
        `points_${context.postId}`,
        0,
        undefined,
        5
      );
      return result.members
        .sort((a, b) => b.score - a.score) // Sort descending by score
        .slice(0, 5) // Limit to top 5 entries
        .map((x) => {
          console.log("Point:" + x.member + " " + x.score);
          return { username: x.member, score: x.score };
        });
    }
    const [points, setPoints] = useState<LeaderboardRow[]>(getPoints);

    // Add new state for puzzle
    const [puzzle] = useState(async () => {
      // Try to get existing puzzle from redis
      const savedPuzzle = await context.redis.get(`puzzle_${context.postId}`);

      if (savedPuzzle) {
        const parsedPuzzle = JSON.parse(savedPuzzle);
        return parsedPuzzle;
      }

      // Select random puzzle and save to redis
      const randomPuzzle =
        DAILY_PUZZLES[Math.floor(Math.random() * DAILY_PUZZLES.length)];
      await context.redis.set(
        `puzzle_${context.postId}`,
        JSON.stringify(randomPuzzle)
      );
      return randomPuzzle;
    });

    const [webviewVisible, setWebviewVisible] = useState(false);

    const [isPlayed, setIsPlayed] = useState(async () => {
      const played = await context.redis.get(
        `isPlayed_${context.postId}_${username}`
      );
      return played === "true";
    });

    const [attempts, setAttempts] = useState(async () => {
      const savedAttempts = await context.redis.get(
        `attempts_${context.postId}_${username}`
      );
      return Number(savedAttempts ?? 1);
    });

    const onMessage = async (msg: WebViewMessage) => {
      console.log("Received message:", msg);
      switch (msg.type) {
        case "setPoints":
          const newPoints = msg.data.newPoints;
          await context.redis.zAdd(`points_${context.postId}`, {
            member: username,
            score: newPoints,
          });
          console.log("Set points:" + newPoints);
          setPoints(await getPoints());
          break;
        case "updateGameState":
          await context.redis.set(
            `isPlayed_${context.postId}_${username}`,
            msg.data.isPlayed.toString()
          );
          await context.redis.set(
            `attempts_${context.postId}_${username}`,
            msg.data.attempts.toString()
          );
          setIsPlayed(msg.data.isPlayed);
          setAttempts(msg.data.attempts);
          break;
        case "returnToMain":
          setWebviewVisible(false);
          break;
        default:
          throw new Error(`Unknown message type: ${msg}`);
      }
    };

    // When the button is clicked, send initial data to web view and show it
    const onShowWebviewClick = async () => {
      const currentPuzzle = await puzzle; // Await the promise
      console.log("Current puzzle:", currentPuzzle);

      if (!currentPuzzle) {
        console.error("No puzzle available");
        return;
      }

      setWebviewVisible(true);
      context.ui.webView.postMessage("myWebView", {
        type: "initialData",
        data: {
          username: username,
          currentPoints: points,
          puzzle: currentPuzzle,
          isPlayed: isPlayed,
          attempts: attempts,
        },
      });
    };

    // Render the custom post type
    return (
      <zstack width="100%" height="100%">
        <image
          url="background.png"
          resizeMode="cover"
          width="100%"
          height="100%"
          imageHeight="1024px"
          imageWidth="2048px"
        ></image>
        {webviewVisible ? (
          <WebViewPage onMessage={onMessage} />
        ) : (
          <MainPage
            username={username}
            points={points}
            onShowWebviewClick={onShowWebviewClick}
          />
        )}
      </zstack>
    );
  },
});

export default Devvit;
