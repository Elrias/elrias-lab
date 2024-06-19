// Définition du canvas et contexte
const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')
canvas.width = innerWidth
canvas.height = innerHeight

// Elements HTML
const scoreElement = document.querySelector('#scoreElement')

const startBtn = document.querySelector('#startBtn')
const leaderboardBtn = document.querySelector('#leaderboardBtn')
const returnBtn = document.querySelector('#returnBtn')

const menuContainer = document.querySelector('#menuContainer')
const endScore = document.querySelector('#endScore')
const leaderboardContainer = document.querySelector('#leaderboardContainer')
const leaderboardList = document.querySelector('#leaderboardList')

const medals = [
    './assets/shooter/gold_medal.png',
    './assets/shooter/silver_medal.png',
    './assets/shooter/bronze_medal.png'
]

// Elements gameplay
let frames = 0
let frameRate = 999
let velocityModifier = 1
let spawnRate

// Definition des classes
class Player {
    constructor(x, y, radius, color) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
    }
    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
    }
}

class Projectile {
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }
    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
    }
    update() {
        this.draw()
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
    }
}

class Enemy {
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }
    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
    }
    update() {
        this.draw()
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
    }
}

const friction = 0.99
class Particle {
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
        this.alpha = 1
    }
    draw() {
        c.save()
        c.globalAlpha = this.alpha
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
        c.restore()
    }
    update() {
        this.draw()
        this.velocity.x *= friction
        this.velocity.y *= friction
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
        this.alpha -= 0.01
    }
}

// Instanciation du Player au centre de l'écran
const x = canvas.width / 2
const y = canvas.height / 2

let player = new Player(x, y, 10, 'white')

// Array des projectiles et des ennemis
let projectiles = []
let enemies = []
let particles = []

function init() {
    player = new Player(x, y, 10, 'white')
    projectiles = []
    enemies = []
    particles = []
    score = 0
    frames = 0
    frameRate = 999
    velocityModifier = 1
    scoreElement.innerHTML = score
    endScore.innerHTML = score
}

function getFrameRate() {
    setTimeout(() => {
        frameRate = frames - 1
        velocityModifier = 144 / frameRate
    }, 1000)
}

// Fonction gérant l'apparition des ennemis sur les bords du canvas
function spawnEnemies() {
    if(frames % spawnRate === 0) {
        // Taille et couleur des ennemis
        const radius = Math.random() * 50 + 5
        const color = "hsl(" + Math.random()*360 + ", 50%, 50%)"
        // Coordonnées d'apparition des ennemis
        let x 
        let y
        // Apparition des ennemis sur un bord aléatoire en X ou en Y
        if(Math.random() < 0.5) {
            x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius
            y = Math.random() * canvas.height
        }
        else {
            x = Math.random() * canvas.width
            y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius
        }
        // Orientation des ennemis vers le centre de l'écran
        const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x)
        const velocity = {
            x: Math.cos(angle) * velocityModifier,
            y: Math.sin(angle) * velocityModifier
        }
        // Ajout de l'ennemi dans l'array
           enemies.push(new Enemy(x, y, radius, color, velocity))
    }
}

// Fonction gérant l'augmentation de la difficulté en fonction du score
function difficultyScaling() {
    if(score < 500) {
        spawnRate = frameRate * 2
    }
    else if (score < 2000 && score >= 500) {
        spawnRate = Math.round(frameRate * 1.5)
    }
    else if (score < 5000 && score >= 2000) {
        spawnRate = frameRate
    }
    else if (score < 10000 && score >= 5000) {
        spawnRate = Math.round(frameRate / 2)
    }
    else {
        spawnRate = Math.round(frameRate / 4)
    }
}


// Fonction gérant l'actualisation et l'animation des différents éléments animés
let animationId
let score = 0

function animate() {

    // Boucle de jeu
    animationId = requestAnimationFrame(animate)

    // Clear des éléments avant actualisation
    c.fillStyle = 'rgba(0, 0, 0)'
    c.fillRect(0, 0, canvas.width, canvas.height)

    // Affichage du joueur
    player.draw()

    // Affichage des particules
    particles.forEach((particle, indexParticle) => {
        if(particle.alpha <= 0) {
            particles.splice(indexParticle, 1)
        }
        else {
            particle.update()
        }
    })

    // Actualisation et affichage des projectiles
    projectiles.forEach((projectile, indexP) => {
        projectile.update()
        // Suppression des projectiles en dehors du canvas
        if (
            projectile.x - projectile.radius > canvas.width ||
            projectile.x + projectile.radius < 0 ||
            projectile.y - projectile.radius > canvas.height ||
            projectile.y + projectile.radius < 0
        ){
            setTimeout(() => {
                projectiles.splice(indexP, 1)
            }, 0)
        }
    })

    // Actualisation et affichage des ennemis
    enemies.forEach((enemy, indexE) => {
        enemy.update()
        // Calcul de la distance entre les ennemis et le joueur
        const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y)
        if(dist - player.radius - enemy.radius < 1) {
            cancelAnimationFrame(animationId)
            updateScore()
            endScore.innerHTML = score
            menuContainer.style.display = 'flex'
        }
        // Calcul de la distance entre les ennemis et les projectiles
        projectiles.forEach((projectile, indexP) => {
            const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y)
            // Collision entre un ennemi et un projectile
            if(dist - enemy.radius - projectile.radius < 1) {
                
                // Création des particules
                for(let i = 0; i < enemy.radius; i++) {
                    particles.push(new Particle(projectile.x, projectile.y, Math.random() * 2, enemy.color,
                    {x: (Math.random() - 0.5) * (Math.random() * 6), y: (Math.random() - 0.5) * (Math.random() * 6)}))
                }

                // Si le radius de l'ennemi est supérieur à 30, réduit sa taille de 15
                if(enemy.radius - 15 > 15) {

                    // Augmentation du score 
                    score += 10
                    scoreElement.innerHTML = score
                    
                    gsap.to(enemy, {
                       radius: enemy.radius - 15
                    })
                    setTimeout(() => {
                        projectiles.splice(indexP, 1)
                    }, 0)
                }
                // Si le radius de l'ennemi est inferieur à 30, détruit l'ennemi
                else {
                    
                    // Augmentation du score
                    score += 50
                    scoreElement.innerHTML = score
                    
                    setTimeout(() => {
                        enemies.splice(indexE, 1)
                        projectiles.splice(indexP, 1)
                    }, 0)
                }
            }
        })
    })
    frames++
    difficultyScaling()
    spawnEnemies()
}

function escapeHTML(str) {
    return str.replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#039;')
}

function getUsername() {
    let userInput = document.getElementById('usernameInput').value

    if(userInput.trim() === '') {
        userInput = 'Anonymous' + Math.round(Math.random() * 99)
    }
    const safeInput = escapeHTML(userInput)
    return safeInput
}

// Fonction gérant l'actualisation du leaderboard
async function updateScore() {
    let exist = false
    const newScorer = { name: getUsername(), score: score }
    const scorers = await fetchScores()
    scorers.forEach((scorer, index) => {
        if(scorer.name === newScorer.name) {
            exist = true
            if(scorer.score < newScorer.score) {
                console.log(newScorer.name + " : " + newScorer.score)
                const newScore = {
                    name: newScorer.name,
                    score: newScorer.score
                }
                editScore(index, newScore)
            }
        }
    })
    if(!exist) {
        submitScore(newScorer.name, newScorer.score)
    }
}

// Récupération des clics et leur position sur l'écran pour créer et orienter les projectiles
addEventListener('click', (event) => {
    const angle = Math.atan2(event.clientY - canvas.height / 2, event.clientX - canvas.width / 2)
    const velocity = {
        x: (Math.cos(angle) *4) * velocityModifier,
        y: (Math.sin(angle) *4) * velocityModifier
    }

    projectiles.push(new Projectile(canvas.width / 2, canvas.height / 2, 5, 'white', velocity))
})

startBtn.addEventListener('click', () => {
    // Start game
    init()
    animate()
    getFrameRate()
    menuContainer.style.display = 'none'
})

leaderboardBtn.addEventListener('click', () => {
    // Load leaderboard
    displayScores()
    leaderboardContainer.style.display = 'flex'
    menuContainer.style.display = 'none'
})

returnBtn.addEventListener('click', () => {
    // Close leaderboard
    menuContainer.style.display = 'flex'
    leaderboardContainer.style.display = 'none'
})

async function submitScore(playerName, playerScore) {
    const scoreData = {
        name: playerName,
        score: playerScore
    }

    try {
        const response = await fetch('http://localhost:3000/api/scores', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(scoreData)
        })

        const result = await response.json();
        console.log(result.message)
    } catch (error) {
        console.error('Error submitting score: ',error)
    }
}

async function fetchScores() {
    try {
        const response = await fetch('http://localhost:3000/api/scores', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })

        if(!response.ok) {
            throw new Error('Network response was not ok')
        }

        const scores = await response.json()
        return scores;
    } catch (error) {
        console.error('Error fetching scores', error)
    }
}

async function editScore(scoreIndex, playerScore) {
    const url = `http://localhost:3000/api/scores/${scoreIndex}`
    const options = {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(playerScore)
    }

    try {
        const response = await fetch(url, options)
        if (!response.ok) {
            const errorMessage = await response.text()
            throw new Error(`Erreur HTTP ${response.status}: ${errorMessage}`)
        }

        const data = await response.json()
        console.log('Score successfully updated', data)
        return data
    } catch (error) {
        console.error('Error updating score:', error.message)
        throw error
    }
}

async function displayScores() {
    const scorers = await fetchScores()
    renderScores(scorers)

}

function renderScores(scores) {
    scores.sort((a, b) => b.score - a.score)
    leaderboardList.innerHTML = ''

    const headerItem = document.createElement('li')
    headerItem.classList.add('header')
    headerItem.innerHTML = `
        <span>Rank</span>
        <span>Username</span>
        <span>Score</span>
    `
    leaderboardList.appendChild(headerItem)
    
    let entries
    if(scores.length<10) {
        entries = scores.length
    }
    else {
        entries = 10
    }

    for(let i = 0; i < entries; i++) {
        const listItem = document.createElement('li')
        
        let rank =''
        if (i < 3) {
            rank = `<img src="${medals[i]}" alt="Medal" class="medal">`
        }
        else {
            rank = i+1 + '.'
        }
        listItem.innerHTML = `
        <span>${rank}</span>
        <span>${scores[i].name}</span>
        <span>${scores[i].score}</span>
        `
        leaderboardList.appendChild(listItem)
    }
}