async function fetchRandomRecipes() {
    const recipesUrl = "https://lcapistran25.pythonanywhere.com/api/v1/recipes";
    const token = localStorage.getItem("authToken");

    if (!token) {
        alert("Você precisa fazer login primeiro!");
        return;
    }

    try {
        const response = await fetch(recipesUrl, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            }            
        });

        if (response.ok) {
            const allRecipes = await response.json();
            // Seleciona 7 receitas aleatórias
            const randomRecipes = getRandomRecipes(allRecipes, 7);
            renderWeeklyRecipes(randomRecipes);
        } else {
            console.error("Erro ao buscar receitas:", response.status);
            alert(`Erro ao buscar receitas: ${response.status} - ${response.statusText}`);
        }
    } catch (error) {
        console.error("Erro ao conectar à API:", error);
        alert("Erro ao conectar ao servidor.");
    }
}

function getRandomRecipes(recipes, count) {
    const shuffled = [...recipes].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

function renderWeeklyRecipes(recipes) {
    const recipesContainer = document.getElementById("recipes-container");
    recipesContainer.innerHTML = "";

    const weekDays = [
        "Segunda-feira",
        "Terça-feira", 
        "Quarta-feira",
        "Quinta-feira",
        "Sexta-feira",
        "Sábado",
        "Domingo"
    ];

    recipes.forEach((recipe, index) => {
        const dayTitle = document.createElement("h3");
        dayTitle.classList.add("week-day-title");
        dayTitle.textContent = weekDays[index];
        
        const card = document.createElement("div");
        card.classList.add("recipe-card");

        const imageUrl = recipe.image || 'caminho/para/imagem-padrao.jpg';
        const heartIconClass = recipe.favorite ? "fas" : "far";

        card.innerHTML = `
            <div class="recipe-header">
                <h2>${recipe.name}</h2>
                <button class="heart-button" onclick="toggleHeart(this, ${recipe.id})">
                    <i class="${heartIconClass} fa-heart"></i>
                </button>
            </div>
            <hr/>
            <div class="description-container">
                <img src="${imageUrl}" alt="${recipe.name}">
                <div>
                    <h3><strong>Descrição</strong></h3>
                    <p>${recipe.description}</p>
                    <div class="recipe-footer">
                        <p class="origins"><em>Origem: ${recipe.origin || "Desconhecida"}</em></p>
                        <button class="view-more-button" onclick="openRecipeDetails(event)">Ver mais</button>
                    </div>
                </div>
            </div>
        `;

        card.setAttribute("data-recipe-id", recipe.id);

        const dayContainer = document.createElement("div");
        dayContainer.classList.add("day-container");
        dayContainer.appendChild(dayTitle);
        dayContainer.appendChild(card);

        recipesContainer.appendChild(dayContainer);
    });
}

// Função para criar status de favorito
async function createFavoriteStatus(recipeId) {
    const updateUrl = `https://lcapistran25.pythonanywhere.com/api/v1/user-recipes/`;
    const token = localStorage.getItem("authToken");
    const userId = localStorage.getItem("userId");

    if (!token) {
        alert("Você precisa fazer login primeiro!");
        return;
    }

    try {
        const response = await fetch(updateUrl, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ user_id: userId, recipe_id: recipeId })
        });

        if (!response.ok) {
            console.error("Erro ao atualizar status de favorito:", response.status);
            alert(`Erro ao atualizar status de favorito: ${response.status} - ${response.statusText}`);
        }
    } catch (error) {
        console.error("Erro ao conectar à API:", error);
        alert("Não foi possível atualizar o status de favorito.");
    }
}

// Função para deletar status de favorito
async function deleteFavoriteStatus(recipeUserId) {
    const deleteUrl = `https://lcapistran25.pythonanywhere.com/api/v1/user-recipes/${recipeUserId}/`;
    const token = localStorage.getItem("authToken");

    if (!token) {
        alert("Você precisa fazer login primeiro!");
        return;
    }

    try {
        const response = await fetch(deleteUrl, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            }
        });

        if (!response.ok) {
            console.error("Erro ao deletar status de favorito:", response.status);
            alert(`Erro ao deletar status de favorito: ${response.status} - ${response.statusText}`);
        }
    } catch (error) {
        console.error("Erro ao conectar à API:", error);
        alert("Não foi possível deletar o status de favorito.");
    }
}

// Função para obter status de favorito
async function getFavoriteStatus(recipeId, userId) {
    const updateUrl = `https://lcapistran25.pythonanywhere.com/api/v1/user-recipes/?user_id=${userId}&recipe_id=${recipeId}`;
    const token = localStorage.getItem("authToken");

    if (!token) {
        alert("Você precisa fazer login primeiro!");
        return;
    }

    try {
        const response = await fetch(updateUrl, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            }
        });

        if (response.ok) {
            const data = await response.json();
            return data;
        } else {
            console.error("Erro ao buscar status de favorito:", response.status);
            alert(`Erro ao buscar status de favorito: ${response.status} - ${response.statusText}`);
        }
    } catch (error) {
        console.error("Erro ao conectar à API:", error);
        alert("Não foi possível buscar o status de favorito.");
    }

    return null;
}

function capitalizeTitle(title) {
    return title
        .split(' ')  // Divide o título em palavras
        .map(word => {
            // Capitaliza a primeira letra e mantém as demais minúsculas
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        })
        .join(' ');  // Junta as palavras novamente em uma string
}

// Função para alternar o ícone de favorito
function toggleHeart(button, recipeId) {
    const icon = button.querySelector("i");
    const isActive = icon.classList.contains("fas");

    if (isActive) {
        icon.classList.remove("fas");
        icon.classList.add("far");
        // Remover dos favoritos
        getFavoriteStatus(recipeId, localStorage.getItem("userId")).then(data => {
            if (data && data.length > 0) {
                deleteFavoriteStatus(data[0].id);
            }
        });
    } else {
        icon.classList.remove("far");
        icon.classList.add("fas");
        // Adicionar aos favoritos
        createFavoriteStatus(recipeId);
    }
}

// Função para renderizar os cards no DOM
function renderRecipes(data) {
    const recipesContainer = document.getElementById("recipes-container");
    recipesContainer.innerHTML = ""; // Limpa o contêiner antes de renderizar

    data.forEach(recipe => {
        const card = document.createElement("div");
        card.classList.add("recipe-card");

        // Fallback para a imagem
        const imageUrl = recipe.image || 'caminho/para/imagem-padrao.jpg';

        // Verifica o status de favorito
        const heartIconClass = recipe.favorite ? "fas" : "far";

        card.innerHTML = `
            <div class="recipe-header">
                <h2>${recipe.name}</h2>
                <button class="heart-button" onclick="toggleHeart(this, ${recipe.id})">
                    <i class="${heartIconClass} fa-heart"></i>
                </button>
            </div>
            <hr/>
            <div class="description-container">
                <img src="${imageUrl}" alt="${recipe.name}">
                <div>
                    <h3><strong>Descrição</strong></h3>
                    <p>${recipe.description}</p>
                    <p class="origins"><em>Origem: ${recipe.origin || "Desconhecida"}</em></p>
                    <!-- Botão "Ver mais" -->
                    <button class="view-more-button" onclick="openRecipeDetails(event)">Ver mais</button>
                </div>
            </div>
        `;

        // Define o ID da receita para uso posterior
        card.setAttribute("data-recipe-id", recipe.id);

        recipesContainer.appendChild(card);
    });
}

// Função chamada quando um card de receita é clicado
function openRecipeDetails(event) {
    const recipeId = event.currentTarget.closest('.recipe-card').getAttribute("data-recipe-id");
    localStorage.setItem("recipeId", recipeId);
    fetchRecipe(); // Implementar função para obter detalhes da receita
}

// Função para abrir o modal e carregar os dados
function openModal(recipe) {
    document.getElementById("recipe-title").textContent = recipe.name;
    document.getElementById("recipe-image").src = recipe.image;
    document.getElementById("recipe-description").textContent = recipe.description;
    document.getElementById("recipe-category").textContent = recipe.category;
    document.getElementById("recipe-origin").textContent = recipe.origin;

    const ingredientsList = document.getElementById("recipe-ingredients");
    ingredientsList.innerHTML = "";
    if (recipe.ingredients.length === 0) {
        const li = document.createElement("li");
        li.textContent = "Nenhum ingrediente disponível.";
        ingredientsList.appendChild(li);
    } else {
        recipe.ingredients.forEach((ingredient) => {
            const li = document.createElement("li");
            li.textContent = ingredient;
            ingredientsList.appendChild(li);
        });
    }

    const stepsList = document.getElementById("recipe-steps");
    stepsList.innerHTML = "";
    if (recipe.steps.length === 0) {
        const li = document.createElement("li");
        li.textContent = "Nenhum passo disponível.";
        stepsList.appendChild(li);
    } else {
        recipe.steps.forEach((step) => {
            const li = document.createElement("li");
            li.textContent = step;
            stepsList.appendChild(li);
        });
    }

    // Mostra o modal
    document.getElementById("recipe-container").classList.remove("hidden");
}

// Função para buscar dados da API
async function fetchRecipe() {
    try {
        const token = localStorage.getItem("authToken");
        const recipeId = localStorage.getItem("recipeId");
        if (!token || !recipeId) {
            alert("ID da receita ou token de autenticação não encontrado.");
            return;
        }

        const response = await fetch(`http://localhost:8000/api/v1/recipes/${recipeId}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            }
        });

        if (!response.ok) {
            throw new Error("Erro ao buscar dados da receita.");
        }

        const recipe = await response.json();
        openModal(recipe); // Chama a função para abrir o modal
    } catch (error) {
        console.error("Erro ao carregar a receita:", error);
        alert("Não foi possível carregar os dados da receita.");
    }
}

// Função para fechar o modal
function closeModal() {
    document.getElementById("recipe-container").classList.add("hidden");
}

// Inicializa a página
document.addEventListener("DOMContentLoaded", () => {
    fetchRandomRecipes();
    loadSidebar();
});