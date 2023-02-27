let players = document.querySelector("ul.players");
const usernameForMain = document.getElementById("username");
const userScore = document.getElementById("score");
const loader = document.querySelector(".lds-ripple");

async function getUsers() {
  try {
    const response = await fetch("https://naval-battles.onrender.com/game/users");
    loader.style.display = "none";
    const usersArray = await response.json();
    for (let i = 0; i < usersArray.length; i++) {
      for (let j = i; j < usersArray.length; j++) {
        if (usersArray[i].score < usersArray[j].score) {
          [usersArray[i], usersArray[j]] = [usersArray[j], usersArray[i]];
        }
      }
    }
    usersArray.forEach((user) => {
      let li = document.createElement("li");
      let userName = document.createElement("span");
      let userScore = document.createElement("span");
      userName.textContent = user.username;
      userScore.textContent = user.score;
      if (user.username === usernameForMain.textContent) {
        userName.className = "active";
        userScore.className = "active";
      }
      li.append(userName, userScore);
      players.append(li);
    });
  } catch (error) {
    console.log(error);
  }
}

getUsers();

export async function setScore() {
  try {
    const response = await fetch(
      `https://naval-battles.onrender.com/game/users/${usernameForMain.textContent}`,
      {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
          score: +userScore.textContent + 1,
        }),
      }
    );
    const data = await response.json(); // will wait a response from server
    console.log(data);
  } catch (error) {
    console.log(error);
  }
}
