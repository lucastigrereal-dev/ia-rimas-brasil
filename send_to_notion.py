#!/usr/bin/env python3
"""
Script para enviar documentação do Verso Genius ao Notion
Requer: pip install notion-client
"""

import os
from notion_client import Client

# Configuração
NOTION_TOKEN = os.getenv('NOTION_TOKEN', 'seu_token_aqui')
DATABASE_ID = os.getenv('NOTION_DATABASE_ID', 'seu_database_id_aqui')

# Inicializar cliente
notion = Client(auth=NOTION_TOKEN)

def create_page():
    """Cria página no Notion com documentação completa"""

    page_data = {
        "parent": {"database_id": DATABASE_ID},
        "icon": {"emoji": "🎤"},
        "properties": {
            "Name": {
                "title": [
                    {
                        "text": {
                            "content": "IA Rimas Brasil - Verso Genius v2.0"
                        }
                    }
                ]
            },
            "Status": {
                "select": {
                    "name": "✅ Produção"
                }
            },
            "Categoria": {
                "multi_select": [
                    {"name": "App"},
                    {"name": "IA"},
                    {"name": "Rap/Hip-Hop"}
                ]
            },
            "URL": {
                "url": "https://ia-rimas-brasil.vercel.app"
            }
        },
        "children": [
            # Header
            {
                "object": "block",
                "type": "heading_1",
                "heading_1": {
                    "rich_text": [{"text": {"content": "🎤 IA RIMAS BRASIL - VERSO GENIUS"}}]
                }
            },
            {
                "object": "block",
                "type": "paragraph",
                "paragraph": {
                    "rich_text": [
                        {"text": {"content": "Status: "}},
                        {"text": {"content": "✅ PRODUÇÃO", "annotations": {"bold": True, "color": "green"}}},
                    ]
                }
            },

            # Links Importantes
            {
                "object": "block",
                "type": "heading_2",
                "heading_2": {
                    "rich_text": [{"text": {"content": "🌐 Links Importantes"}}]
                }
            },
            {
                "object": "block",
                "type": "bulleted_list_item",
                "bulleted_list_item": {
                    "rich_text": [
                        {"text": {"content": "App Live: "}},
                        {"text": {"content": "https://ia-rimas-brasil.vercel.app", "link": {"url": "https://ia-rimas-brasil.vercel.app"}}}
                    ]
                }
            },
            {
                "object": "block",
                "type": "bulleted_list_item",
                "bulleted_list_item": {
                    "rich_text": [
                        {"text": {"content": "GitHub: "}},
                        {"text": {"content": "https://github.com/lucastigrereal-dev/ia-rimas-brasil", "link": {"url": "https://github.com/lucastigrereal-dev/ia-rimas-brasil"}}}
                    ]
                }
            },

            # Estatísticas
            {
                "object": "block",
                "type": "heading_2",
                "heading_2": {
                    "rich_text": [{"text": {"content": "📊 Estatísticas"}}]
                }
            },
            {
                "object": "block",
                "type": "callout",
                "callout": {
                    "icon": {"emoji": "🔥"},
                    "rich_text": [
                        {"text": {"content": "90.849 rimas • 2.718 letras • 33 artistas\n215 gírias regionais (19 estados) • 6 técnicas • 3 exercícios"}}
                    ],
                    "color": "yellow_background"
                }
            },

            # Diferenciais
            {
                "object": "block",
                "type": "heading_2",
                "heading_2": {
                    "rich_text": [{"text": {"content": "⭐ Diferenciais ÚNICOS"}}]
                }
            },
            {
                "object": "block",
                "type": "numbered_list_item",
                "numbered_list_item": {
                    "rich_text": [
                        {"text": {"content": "Gírias Regionais BR", "annotations": {"bold": True}}},
                        {"text": {"content": " - ÚNICO app com 215 gírias de 19 estados"}}
                    ]
                }
            },
            {
                "object": "block",
                "type": "numbered_list_item",
                "numbered_list_item": {
                    "rich_text": [
                        {"text": {"content": "Banco Massivo", "annotations": {"bold": True}}},
                        {"text": {"content": " - 90k+ rimas (maior do Brasil)"}}
                    ]
                }
            },
            {
                "object": "block",
                "type": "numbered_list_item",
                "numbered_list_item": {
                    "rich_text": [
                        {"text": {"content": "IA Híbrida", "annotations": {"bold": True}}},
                        {"text": {"content": " - Ollama (grátis) + GPT-4o-mini (R$ 0,001)"}}
                    ]
                }
            },
            {
                "object": "block",
                "type": "numbered_list_item",
                "numbered_list_item": {
                    "rich_text": [
                        {"text": {"content": "Score Automático", "annotations": {"bold": True}}},
                        {"text": {"content": " - Avaliação de qualidade 0-10"}}
                    ]
                }
            },

            # Stack Técnica
            {
                "object": "block",
                "type": "heading_2",
                "heading_2": {
                    "rich_text": [{"text": {"content": "🏗️ Stack Tecnológica"}}]
                }
            },
            {
                "object": "block",
                "type": "paragraph",
                "paragraph": {
                    "rich_text": [
                        {"text": {"content": "Frontend: ", "annotations": {"bold": True}}},
                        {"text": {"content": "React 18, TypeScript 5, Vite, TailwindCSS, Framer Motion\n"}},
                        {"text": {"content": "Backend: ", "annotations": {"bold": True}}},
                        {"text": {"content": "Node.js, Hono, SQLite, Zod, OpenAI SDK\n"}},
                        {"text": {"content": "Deploy: ", "annotations": {"bold": True}}},
                        {"text": {"content": "Vercel (auto-deploy from GitHub)"}}
                    ]
                }
            },

            # Roadmap
            {
                "object": "block",
                "type": "heading_2",
                "heading_2": {
                    "rich_text": [{"text": {"content": "📈 Roadmap"}}]
                }
            },
            {
                "object": "block",
                "type": "to_do",
                "to_do": {
                    "rich_text": [{"text": {"content": "Fase 1: Sistema de Drill Interativo (2 semanas)"}}],
                    "checked": False
                }
            },
            {
                "object": "block",
                "type": "to_do",
                "to_do": {
                    "rich_text": [{"text": {"content": "Fase 2: Página de Gírias Regionais (1 semana)"}}],
                    "checked": False
                }
            },
            {
                "object": "block",
                "type": "to_do",
                "to_do": {
                    "rich_text": [{"text": {"content": "Fase 3: Features Sociais (3 semanas)"}}],
                    "checked": False
                }
            },
            {
                "object": "block",
                "type": "to_do",
                "to_do": {
                    "rich_text": [{"text": {"content": "Fase 4: Monetização + Integração Clínica (1 mês)"}}],
                    "checked": False
                }
            },

            # Integração Negócio
            {
                "object": "block",
                "type": "heading_2",
                "heading_2": {
                    "rich_text": [{"text": {"content": "💰 Integração Clínica (Cláudio)"}}]
                }
            },
            {
                "object": "block",
                "type": "quote",
                "quote": {
                    "rich_text": [
                        {"text": {"content": "Modelo: App Grátis → Banner Clínica → Landing Page → Conversão\n"}},
                        {"text": {"content": "Taxa esperada: 1-3% de conversão\n"}},
                        {"text": {"content": "Com 1.000 MCs/mês → 10-30 leads qualificados"}}
                    ],
                    "color": "green_background"
                }
            },

            # Footer
            {
                "object": "block",
                "type": "divider",
                "divider": {}
            },
            {
                "object": "block",
                "type": "paragraph",
                "paragraph": {
                    "rich_text": [
                        {"text": {"content": "📅 Última atualização: 12/01/2026\n"}},
                        {"text": {"content": "👤 Desenvolvido por Tigrão | Parceiro: Cláudio"}}
                    ]
                }
            }
        ]
    }

    try:
        response = notion.pages.create(**page_data)
        print(f"✅ Página criada com sucesso!")
        print(f"🔗 URL: {response['url']}")
        return response
    except Exception as e:
        print(f"❌ Erro ao criar página: {e}")
        return None

if __name__ == "__main__":
    print("🎤 Enviando documentação para o Notion...\n")

    if NOTION_TOKEN == 'seu_token_aqui':
        print("⚠️  Configure as variáveis de ambiente:")
        print("   export NOTION_TOKEN='seu_token_notion'")
        print("   export NOTION_DATABASE_ID='seu_database_id'")
        print("\n📚 Guia: https://developers.notion.com/docs/create-a-notion-integration")
    else:
        create_page()
