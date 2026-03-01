// Função para buscar receitas do endpoint protegido
async function fetchRecipes() {
    const userId = localStorage.getItem("userId");
    const recipesUrl = `https://lcapistran25.pythonanywhere.com/api/v1/recipes/?user_id=${userId}`;
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
            const recipes = await response.json();
            renderRecipes(recipes); // Chama a função para exibir os cards
        } else {
            console.error("Erro ao buscar receitas:", response.status);
            alert(`Erro ao buscar receitas: ${response.status} - ${response.statusText}`);
        }
    } catch (error) {
        console.error("Erro ao conectar à API:", error);
        alert("Não foi possível buscar as receitas.");
    }
}

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
            body: JSON.stringify(
                { user_id: userId,
                recipe_id: recipeId
            })
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

function capitalizeTitle(title) {
    return title
        .split(' ')  // Divide o título em palavras
        .map(word => {
            // Capitaliza a primeira letra e mantém as demais minúsculas
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        })
        .join(' ');  // Junta as palavras novamente em uma string
}

// Função para alternar o ícone de coração
function toggleHeart(button,  recipeId) {
    const icon = button.querySelector("i");
    const isActive = icon.classList.contains("fas"); // Verifica se está preenchido

    if (isActive) {
        icon.classList.remove("fas"); // Coração preenchido
        icon.classList.add("far");  // Coração vazio
        getFavoriteStatus(recipeId, localStorage.getItem("userId")).then(data => {
            if (data.length > 0) {
                deleteFavoriteStatus(data[0].id);
            }
        });
        
    } else {
        icon.classList.remove("far"); // Coração vazio
        icon.classList.add("fas");  // Coração preenchido
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

        // Define o ícone inicial do coração (preenchido se `status` for true)
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

        recipesContainer.appendChild(card);
    });
}

// Chama a função para buscar receitas ao carregar a página
document.addEventListener("DOMContentLoaded", fetchRecipes);
