// Définition du canvas et contexte
const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = innerWidth
canvas.height = innerHeight

const scoreElement = document.querySelector('#scoreElement')
const startBtn = document.querySelector('#startBtn')
const menuContainer = document.querySelector('#menuContainer')
const endScore = document.querySelector('#endScore')

let frames = 0
let spawnRate = 240

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
//let bonuses = []

function init() {
    player = new Player(x, y, 10, 'white')
    projectiles = []
    enemies = []
    particles = []
    score = 0
    scoreElement.innerHTML = score
    endScore.innerHTML = score
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
            x: Math.cos(angle),
            y: Math.sin(angle)
        }
        // Ajout de l'ennemi dans l'array
           enemies.push(new Enemy(x, y, radius, color, velocity))
    }
}

// Fonction gérant l'augmentation de la difficulté en fonction du score
function difficultyScaling() {
    if(score < 500) {
        spawnRate = 240
    }
    else if (score < 2000 && score >= 500) {
        spawnRate = 180
    }
    else if (score < 5000 && score >= 2000) {
        spawnRate = 120
    }
    else if (score < 10000 && score >= 5000) {
        spawnRate = 60
    }
    else {
        spawnRate = 30
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

// Récupération des clics et leur position sur l'écran pour créer et orienter les projectiles
addEventListener('click', (event) => {
    const angle = Math.atan2(event.clientY - canvas.height / 2, event.clientX - canvas.width / 2)
    const velocity = {
        x: Math.cos(angle) *4,
        y: Math.sin(angle) *4
    }

    projectiles.push(new Projectile(canvas.width / 2, canvas.height / 2, 5, 'white', velocity))
})

startBtn.addEventListener('click', () => {
    // Départ du jeu
    init()
    animate()
    menuContainer.style.display = 'none'
})