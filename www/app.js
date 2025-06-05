// const socket = io("http://localhost:3000")

const { createApp } = Vue
const BASE_URL = "https://guess-admin.onrender.com"
var socket = null
const LoginPage = {
  template: `
    <div class="row justify-content-center">
    <div class="col-md-6">
      <div class="card shadow-lg">
        <div class="card-header text-center">
          <h4>{{ showLogin ? 'Login' : 'Register' }}</h4>
        </div>
        <div class="card-body">
        <div v-if="isLoading" class="text-center">
          <div class="spinner-border" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
          <!-- Login Form -->
          <form v-if="showLogin" @submit.prevent="login">
            <div class="mb-3">
              <label class="form-label">Username</label>
              <input type="text" v-model="loginForm.username" class="form-control" required>
            </div>
            <div class="mb-3">
              <label class="form-label">Password</label>
              <input type="password" v-model="loginForm.password" class="form-control" required>
            </div>
            <button type="submit" class="btn btn-primary w-100">Login</button>
          </form>

          <!-- Register Form -->
          <form v-else @submit.prevent="register">
            <div class="mb-3">
              <label class="form-label">Full Name</label>
              <input type="text" v-model="registerForm.username" class="form-control" required>
            </div>
            <div class="mb-3">
              <label class="form-label">Email</label>
              <input type="email" v-model="registerForm.email" class="form-control" required>
            </div>
            <div class="mb-3">
              <label class="form-label">Password</label>
              <input type="password" v-model="registerForm.password" class="form-control" required>
            </div>
            <button type="submit" class="btn btn-success w-100">Register</button>
          </form>
        </div>
        <div class="card-footer text-center">
          <p class="mb-0">
            <span v-if="showLogin">Don't have an account?</span>
            <span v-else>Already have an account?</span>
            <a href="#" @click.prevent="toggleView">
              {{ showLogin ? 'Register' : 'Login' }}
            </a>
          </p>
        </div>
      </div>
    </div>
  </div>
    `,
  data() {
    return {
      isLoading: false,
      showLogin: true,
      loginForm: {
        username: '',
        password: ''
      },
      registerForm: {
        username: '',
        email: '',
        password: ''
      }
    };
  },
  methods: {
    toggleView() {
      this.showLogin = !this.showLogin;
    },
    async login() {
      try {
        this.isLoading = true
        const request = await axios.post(`${BASE_URL}/api/auth/login`, this.loginForm)

        if (request.status === 200) {
          this.isLoading = false
          console.log('Login successful!');
          const response = request.data
          window.localStorage.setItem("token", response.token)
          window.localStorage.setItem("username", this.loginForm.username)
          this.$router.push('/home');
        }

      } catch (err) {
        this.isLoading = false
        console.error(err);
      }
    },
    async register() {
      this.isLoading = true
      try {
        const request = await axios.post(`${BASE_URL}/api/auth/register`, this.registerForm)
        if (request.status >= 200) {
          this.isLoading = false
          console.log('Registration successful!');
          this.showLogin = true;
        }
      } catch (err) {
        this.isLoading = false
        console.error(err);
      }
    }
  }
}

const HomePage = {
  template: `
    <div class="row justify-content-center">
    <div class="col-md-8">
      <div class="card shadow-lg">
        <div class="card-header text-center">
          <h4>Welcome to the Game Lobby</h4>
        </div>
        <div class="card-body">
          <!-- Start Game Section -->
          <div class="mb-5">
            <h5 class="text-center">Create a New Game</h5>
            <form @submit.prevent="generateGameCode">
              <div class="mb-3">
                <label class="form-label">Select Category</label>
                <select class="form-select" @change="handleCategoryChange($event)" v-model="newGame.category" required>
                  <option disabled value="">-- Choose Category --</option>
                    <option v-for="category in categories" :key="category.ID" :value="category.ID">
                        {{ category.name }}
                    </option>
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label">Enter Topic</label>
                <select class="form-select" v-model="newGame.topic" required>
                <option disabled value="">-- Choose Topic --</option>
                <option v-for="topic in topics" :key="topic.ID" :value="topic.ID">
                    {{ topic.name }}
                </option>
              </select>
              </div>
              <button class="btn btn-primary w-100">Generate Game Code</button>
            </form>

            <!-- Game Code Display & Final Start Button -->
            <div v-if="newGame.code" class="mt-4 alert alert-success text-center">
              Game Code: <strong>{{ newGame.code }}</strong><br>
              <button class="btn btn-success mt-3" @click="startGame">Start Game</button>
            </div>
          </div>

          <hr>

          <!-- Join Game Section -->
          <div class="text-center">
            <h5>Join an Existing Game</h5>
            <form @submit.prevent="joinGame" class="mt-3">
              <input type="text" class="form-control mb-2 text-center" v-model="joinCode" placeholder="Enter Game Code" required>
              <button class="btn btn-success">Join Game</button>
            </form>
            <div v-if="joinMessage" class="mt-2 alert alert-info">
              {{ joinMessage }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
    `,
  data() {
    return {
      newGame: {
        category: '',
        topic: '',
        code: ''
      },
      joinCode: '',
      joinMessage: '',
      categories: [],
      topics: []
    };
  },
  mounted() {
    Promise.all([
      this.fetchCategories(),
    ])
      .catch(err => {
        console.error(err);
      });
  },
  methods: {
    generateGameCode() {
      if (this.newGame.category && this.newGame.topic) {
        this.newGame.code = Math.random().toString(36).substring(2, 8).toUpperCase();
      }
    },
    startGame() {
   
      window.localStorage.setItem("gameCode", this.newGame.code)
      window.localStorage.setItem("topicId", this.newGame.topic)
      window.localStorage.setItem("isHost", true)
      console.log(this.newGame)
      this.$router.push('/lobby');
    },
    joinGame() {
      if (this.joinCode.trim()) {
        this.joinMessage = `Attempting to join game with code: ${this.joinCode}`
        window.localStorage.setItem("gameCode", this.joinCode)
        window.localStorage.setItem("isHost", false)
        this.$router.push('/lobby');
      }
    },
    handleCategoryChange($event) {
      const id = $event.target.value
      this.fetchTopics(id)
    },
    async fetchCategories() {
      try {
        const response = await axios.get(`${BASE_URL}/api/category/list`, {
          'headers': {
            'Authorization': `Bearer ${window.localStorage.getItem('token')}`
          }
        });
        this.categories = response.data;
      } catch (error) {
        console.error("Error fetching categories:", error);
        if (error.status === 401) {
          console.log("Unauthorized")
          window.localStorage.removeItem("token")
          this.$router.push('/login')
        }
      }
    },
    async fetchTopics(id) {
      try {
        const response = await axios.get(`${BASE_URL}/api/topic/list/${id}`, {
          'headers': {
          }
        })
        this.topics = response.data;
      } catch (err) {
        console.log(err)
      }
    }
  }
}

const LobbyPage = {
  template: `
    <div class="row justify-content-center">
    <div class="col-md-8">
      <div class="card shadow-lg">
        <div class="card-header text-center">
          <h4>Game Lobby</h4>
          <p class="mb-0">Game Code: <strong>{{ gameCode }}</strong></p>
          <p>{{timer}}</p>
        </div>
        <div class="card-body">
          <h5>Waiting for players to join...</h5>
          <ul class="list-group mt-3">
            <li class="list-group-item d-flex justify-content-between align-items-center" v-for="(user, index) in users" :key="index">
              {{ user.name }}
            </li>
          </ul>

          <div class="text-center mt-4" v-if="isHost=='true'">
            <button class="btn btn-success" @click="startGame">Start Game</button>
          </div>
        </div>
      </div>
    </div>
  </div>
    `,
  mounted() {
    this.gameCode = window.localStorage.getItem("gameCode")
    this.timer = 10
    socket = io("localhost:3000")
    socket.on("connect", () => {
      console.log("Connected to the server");
      const members = {
        name: window.localStorage.getItem("username"),
        gameCode: this.gameCode,
        isHost: window.localStorage.getItem("isHost"), 
        topic: window.localStorage.getItem("topicId")
      }
      socket.emit("joined", JSON.stringify(members));
    });

    socket.on("members", (member) => {
      this.users.push(member)
    })

    socket.on("lobby", (user) => {
      console.log(user)
      this.users.push(user)
    });

    socket.on("guest added", (user) => {
      this.$router.push('/playground');
    })

    setInterval(() => {
      if (this.timer > 0) {
        this.timer--
      } else {
        // socket.emit("start", this.gameCode)
      }
    }, 1000)
  },
  data() {
    return {
      gameCode: '', // This should be dynamically passed
      timer: 10,
      isHost: window.localStorage.getItem("isHost"),        // For demo purposes, we assume the current user is the host
      users: []
    };
  },
  methods: {
    startGame() {
      const members = {
        name: window.localStorage.getItem("username"),
        gameCode: this.gameCode,
        token: window.localStorage.getItem("token"),
        isHost: window.localStorage.getItem("isHost"), 
        topic: window.localStorage.getItem("topicId")
      }
      socket.emit("start game", JSON.stringify(members));
      socket.emit("add guest", JSON.stringify(members));
      this.$router.push('/playground');
    }
  }
}

const PlaygroundPage = {
  template: `
  <div class="card shadow-lg">
  <div class="card-header text-center">
    <h4>Playground - Question {{ questionNumber }}</h4>
      <span class="badge bg-warning text-dark fs-5">
        ⏳ {{ timeLeft }}s
      </span>
  </div>

  <div class="card-body text-center">
    <!-- Question Image -->
    <img :src="question?.image_url" alt="Question Image" class="img-fluid rounded mb-4" style="max-height: 400px; width: auto;">

    <!-- Options -->
    <div class="row">
      <div class="col-md-6 mb-3">
        <button
          class="btn btn-outline-primary w-100 py-3"
          :class="{ 'btn-success': selectedOption === question?.option1 && isCorrect, 'btn-danger': selectedOption === question?.option1 && !isCorrect }"
          @click="selectOption(question?.option1)"
          :disabled="selectedOption"
        >
          {{ question?.option1 }}
        </button>
        <button
          class="btn btn-outline-primary w-100 py-3 mt-2"
          :class="{ 'btn-success': selectedOption === question?.option2 && isCorrect, 'btn-danger': selectedOption === question?.option2 && !isCorrect }"
          @click="selectOption(question?.option2)"
          :disabled="selectedOption"
        >
          {{ question?.option2 }}
        </button>
      </div>
        <div class="col-md-6 mb-3">
        <button
          class="btn btn-outline-primary w-100 py-3 mt-2"
          :class="{ 'btn-success': selectedOption === question?.option3 && isCorrect, 'btn-danger': selectedOption === question?.option3 && !isCorrect }"
          @click="selectOption(question?.option3)"
          :disabled="selectedOption"
        >
          {{ question?.option3 }}
        </button>
        <button
          class="btn btn-outline-primary w-100 py-3 mt-2"
          :class="{ 'btn-success': selectedOption === question?.option4 && isCorrect, 'btn-danger': selectedOption === question?.option4 && !isCorrect }"
          @click="selectOption(question?.option4)"
          :disabled="selectedOption"
        >
          {{ question?.option4 }}
        </button>
      </div>
    </div>

    <!-- Feedback -->
    <div v-if="selectedOption" class="alert mt-3" :class="isCorrect ? 'alert-success' : 'alert-danger'">
      {{ isCorrect ? 'Correct!' : 'Oops, try again.' }}
    </div>
  </div>
</div>`,
data() {
  return {
    questionNumber: 0,
    question: null,
    selectedOption: null,
    isCorrect: false,
    timeLeft: 5, 
    timer: null,
    playerScore: 0,
    topicId: window.localStorage.getItem("topicId"),
  };
},
mounted() {
  socket.on("question", (question) => {
    console.log(question)
    this.question = question
    this.selectedOption = null
    this.isCorrect = false
    if(this.topicId == null){
      window.localStorage.setItem("topicId", question.topic_id)
    }
    this.questionNumber++
    this.startTimer()
  })

  socket.on("end", (message) => {
    console.log(message)
    this.storeGameSession()
    this.$router.push('/winner')
  })
},
methods: {
  selectOption(option) {
    this.selectedOption = option;
    this.isCorrect = (option === this.question.answer); 
    if (this.isCorrect) {
      this.playerScore += 10;
      // Emit score to server if needed
      socket.emit("score", { name: window.localStorage.getItem("username"), score: this.playerScore });
    }
  },
  async storeGameSession() {
    try{
      const formData = {
        topic_id: window.localStorage.getItem("topicId"),
        code: window.localStorage.getItem("gameCode"),
        player_score: this.playerScore.toString(),
        player_name: window.localStorage.getItem("username")
      }
      console.log(formData)
      const request = await axios.post(`${BASE_URL}/api/game/create`, formData, {
        'headers': {
          'Authorization': `Bearer ${window.localStorage.getItem('token')}`,
        }
      })
      if (request.status === 200) {
        console.log('Game session stored successfully!');
      }
    }catch(err){
      console.error(err)
    }
  },
   startTimer() {
    // Clear any previous timer
    if (this.timer) clearInterval(this.timer);

    this.timeLeft = 5;
    this.timer = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
      } else {
        clearInterval(this.timer);
        this.timer = null;
        // Optional: emit timeout event or auto-select null
      }
    }, 1000);
  }
}
}

const WinnerPage = {
  template: `
    <div class="card shadow-lg">
    <div class="card-header">
      <h2 class="text-success">🎉 Game Over!</h2>
    </div>
    <div class="card-body">
      <h4 class="mb-4">Here are the results:</h4>
      <div v-if="isLoading" class="text-center">
        Gathering results ...
      </div>

      <div class="row justify-content-center">
        <div class="col-md-5 mb-3" v-for="player in players" :key="player.player_name">
          <div class="card border-3"
               :class="winner.name === player.name ? 'border-success' : 'border-secondary'">
            <div class="card-body">
              <h5 class="card-title">{{ player.player_name }}</h5>
              <p class="card-text fs-4">Score: {{ player.player_score }}</p>
              <span v-if="winner.player_name === player.player_name" class="badge bg-success fs-6">🏆 Winner</span>
            </div>
          </div>
        </div>
      </div>

      <button class="btn btn-primary mt-4" @click="playAgain">Play Again</button>
    </div>
  </div>`,
  data() {
    return {
      players: [],
      isLoading: true,
    };
  },
  mounted(){
    setTimeout(() => {
      // Gathering leaderboard data from the server
      this.getScores()
      this.isLoading = false;
    }, 3000)

  },
  computed: {
    winner() {
      return this.players.reduce((max, player) =>
        player.player_score > max.player_score ? player : max, this.players[0]);
    }
  },
  methods: {
    playAgain() {
      // Redirect to lobby or restart game
      const data = {
        name: window.localStorage.getItem("username"),
        gameCode: window.localStorage.getItem("gameCode")
      }
      socket.emit("leave", JSON.stringify(data))
      window.localStorage.removeItem("gameCode")
      window.localStorage.removeItem("topicId")
      window.localStorage.removeItem("isHost")
      socket.disconnect()
      this.$router.push('/dashboard');
    },
    async getScores() {
      try {
        const response = await axios.get(`${BASE_URL}/api/game/list/${window.localStorage.getItem("gameCode")}`, {
          'headers': {
            'Authorization': `Bearer ${window.localStorage.getItem('token')}`,
          }
        });
        this.players = response.data;
      } catch (error) {
        console.error("Error fetching scores:", error);
      }
    }
  }
}

const routes = [
  { path: '/login', component: LoginPage },
  { path: '/dashboard', component: HomePage, meta: { requiresAuth: true } },
  { path: '/lobby', component: LobbyPage, meta: { requiresAuth: true } },
  { path: '/playground', component: PlaygroundPage, meta: { requiresAuth: true } },
  { path: '/winner', component: WinnerPage, meta: { requiresAuth: true } },
  { path: '/:pathMatch(.*)*', redirect: '/dashboard' }
]

const router = VueRouter.createRouter({
  history: VueRouter.createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const token = window.localStorage.getItem('token')
  if (to.meta.requiresAuth && !token) {
    next({ path: '/login' })
  } else {
    next()
  }
})

const app = Vue.createApp({})
app.use(router)
app.mount('#app')