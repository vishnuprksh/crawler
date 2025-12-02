import dash
from dash import dcc, html, Input, Output, State, callback
import requests
import json
from datetime import datetime

# Initialize Dash app
app = dash.Dash(__name__)
app.title = "Crawler Backend API Tester"

# Default API base URL (deployed)
DEFAULT_API_URL = "http://31.97.232.229:8000"

# Define the layout
app.layout = html.Div(
    [
        # Header
        html.Div(
            [
                html.H1("Crawler Backend API Tester", style={"marginBottom": "10px"}),
                html.P(
                    "Interactive tool to test the deployed crawler backend API",
                    style={"color": "#666", "marginBottom": "20px"}
                ),
            ],
            style={"padding": "20px", "borderBottom": "2px solid #ddd", "marginBottom": "20px"}
        ),

        # API URL Configuration
        html.Div(
            [
                html.Label("API Base URL:", style={"fontWeight": "bold"}),
                dcc.Input(
                    id="api-url-input",
                    type="text",
                    value=DEFAULT_API_URL,
                    style={
                        "width": "100%",
                        "padding": "8px",
                        "marginBottom": "10px",
                        "borderRadius": "4px",
                        "border": "1px solid #ddd"
                    }
                ),
            ],
            style={"padding": "20px", "backgroundColor": "#f9f9f9", "marginBottom": "20px", "borderRadius": "4px"}
        ),

        # Tabs for different endpoints
        dcc.Tabs(
            id="tabs",
            value="topics-tab",
            children=[
                # Topics Tab
                dcc.Tab(
                    label="Topics",
                    value="topics-tab",
                    children=[
                        html.Div(
                            [
                                html.Div(
                                    [
                                        html.H3("Get Topics"),
                                        html.Button(
                                            "Fetch Topics",
                                            id="fetch-topics-btn",
                                            n_clicks=0,
                                            style={
                                                "padding": "10px 20px",
                                                "backgroundColor": "#007bff",
                                                "color": "white",
                                                "border": "none",
                                                "borderRadius": "4px",
                                                "cursor": "pointer"
                                            }
                                        ),
                                        html.Div(id="fetch-topics-output", style={"marginTop": "10px"}),
                                    ],
                                    style={"marginBottom": "30px"}
                                ),
                                html.Hr(),
                                html.Div(
                                    [
                                        html.H3("Create Topic"),
                                        html.Div(
                                            [
                                                html.Label("Topic ID:", style={"fontWeight": "bold"}),
                                                dcc.Input(
                                                    id="create-topic-id",
                                                    type="text",
                                                    placeholder="e.g., tech-news",
                                                    style={"width": "100%", "padding": "8px", "marginBottom": "10px", "borderRadius": "4px", "border": "1px solid #ddd"}
                                                ),
                                            ]
                                        ),
                                        html.Div(
                                            [
                                                html.Label("Query:", style={"fontWeight": "bold"}),
                                                dcc.Input(
                                                    id="create-topic-query",
                                                    type="text",
                                                    placeholder="e.g., latest technology trends",
                                                    style={"width": "100%", "padding": "8px", "marginBottom": "10px", "borderRadius": "4px", "border": "1px solid #ddd"}
                                                ),
                                            ]
                                        ),
                                        html.Div(
                                            [
                                                html.Label("Icon/Emoji:", style={"fontWeight": "bold"}),
                                                dcc.Input(
                                                    id="create-topic-icon",
                                                    type="text",
                                                    placeholder="e.g., 💻",
                                                    value="📰",
                                                    style={"width": "100%", "padding": "8px", "marginBottom": "10px", "borderRadius": "4px", "border": "1px solid #ddd"}
                                                ),
                                            ]
                                        ),
                                        html.Button(
                                            "Create Topic",
                                            id="create-topic-btn",
                                            n_clicks=0,
                                            style={
                                                "padding": "10px 20px",
                                                "backgroundColor": "#28a745",
                                                "color": "white",
                                                "border": "none",
                                                "borderRadius": "4px",
                                                "cursor": "pointer"
                                            }
                                        ),
                                        html.Div(id="create-topic-output", style={"marginTop": "10px"}),
                                    ]
                                ),
                                html.Hr(),
                                html.Div(
                                    [
                                        html.H3("Delete Topic"),
                                        html.Div(
                                            [
                                                html.Label("Topic ID to Delete:", style={"fontWeight": "bold"}),
                                                dcc.Input(
                                                    id="delete-topic-id",
                                                    type="text",
                                                    placeholder="e.g., tech-news",
                                                    style={"width": "100%", "padding": "8px", "marginBottom": "10px", "borderRadius": "4px", "border": "1px solid #ddd"}
                                                ),
                                            ]
                                        ),
                                        html.Button(
                                            "Delete Topic",
                                            id="delete-topic-btn",
                                            n_clicks=0,
                                            style={
                                                "padding": "10px 20px",
                                                "backgroundColor": "#dc3545",
                                                "color": "white",
                                                "border": "none",
                                                "borderRadius": "4px",
                                                "cursor": "pointer"
                                            }
                                        ),
                                        html.Div(id="delete-topic-output", style={"marginTop": "10px"}),
                                    ]
                                ),
                            ],
                            style={"padding": "20px"}
                        )
                    ]
                ),

                # Feed Tab
                dcc.Tab(
                    label="Feed",
                    value="feed-tab",
                    children=[
                        html.Div(
                            [
                                html.H3("Get Feed (Active Articles)"),
                                html.Button(
                                    "Fetch Feed",
                                    id="fetch-feed-btn",
                                    n_clicks=0,
                                    style={
                                        "padding": "10px 20px",
                                        "backgroundColor": "#007bff",
                                        "color": "white",
                                        "border": "none",
                                        "borderRadius": "4px",
                                        "cursor": "pointer"
                                    }
                                ),
                                html.Div(id="fetch-feed-output", style={"marginTop": "10px"}),
                            ],
                            style={"padding": "20px"}
                        )
                    ]
                ),

                # Archive Tab
                dcc.Tab(
                    label="Archive",
                    value="archive-tab",
                    children=[
                        html.Div(
                            [
                                html.Div(
                                    [
                                        html.H3("Get Archive (Archived Articles)"),
                                        html.Button(
                                            "Fetch Archive",
                                            id="fetch-archive-btn",
                                            n_clicks=0,
                                            style={
                                                "padding": "10px 20px",
                                                "backgroundColor": "#007bff",
                                                "color": "white",
                                                "border": "none",
                                                "borderRadius": "4px",
                                                "cursor": "pointer"
                                            }
                                        ),
                                        html.Div(id="fetch-archive-output", style={"marginTop": "10px"}),
                                    ],
                                    style={"marginBottom": "30px"}
                                ),
                                html.Hr(),
                                html.Div(
                                    [
                                        html.H3("Archive Article"),
                                        html.Div(
                                            [
                                                html.Label("Article ID to Archive:", style={"fontWeight": "bold"}),
                                                dcc.Input(
                                                    id="archive-article-id",
                                                    type="text",
                                                    placeholder="UUID of article",
                                                    style={"width": "100%", "padding": "8px", "marginBottom": "10px", "borderRadius": "4px", "border": "1px solid #ddd"}
                                                ),
                                            ]
                                        ),
                                        html.Button(
                                            "Archive Article",
                                            id="archive-article-btn",
                                            n_clicks=0,
                                            style={
                                                "padding": "10px 20px",
                                                "backgroundColor": "#ffc107",
                                                "color": "black",
                                                "border": "none",
                                                "borderRadius": "4px",
                                                "cursor": "pointer"
                                            }
                                        ),
                                        html.Div(id="archive-article-output", style={"marginTop": "10px"}),
                                    ]
                                ),
                            ],
                            style={"padding": "20px"}
                        )
                    ]
                ),

                # Generate Tab
                dcc.Tab(
                    label="Generate Article",
                    value="generate-tab",
                    children=[
                        html.Div(
                            [
                                html.H3("Generate Article from Topic"),
                                html.Div(
                                    [
                                        html.Label("Topic ID:", style={"fontWeight": "bold"}),
                                        dcc.Input(
                                            id="generate-topic-id",
                                            type="text",
                                            placeholder="e.g., tech-news",
                                            style={"width": "100%", "padding": "8px", "marginBottom": "10px", "borderRadius": "4px", "border": "1px solid #ddd"}
                                        ),
                                    ]
                                ),
                                html.Button(
                                    "Generate Article",
                                    id="generate-article-btn",
                                    n_clicks=0,
                                    style={
                                        "padding": "10px 20px",
                                        "backgroundColor": "#6f42c1",
                                        "color": "white",
                                        "border": "none",
                                        "borderRadius": "4px",
                                        "cursor": "pointer"
                                    }
                                ),
                                html.Div(id="generate-article-output", style={"marginTop": "10px"}),
                            ],
                            style={"padding": "20px"}
                        )
                    ]
                ),

                # Health Check Tab
                dcc.Tab(
                    label="Health Check",
                    value="health-tab",
                    children=[
                        html.Div(
                            [
                                html.H3("API Health Check"),
                                html.Button(
                                    "Check API Health",
                                    id="health-check-btn",
                                    n_clicks=0,
                                    style={
                                        "padding": "10px 20px",
                                        "backgroundColor": "#20c997",
                                        "color": "white",
                                        "border": "none",
                                        "borderRadius": "4px",
                                        "cursor": "pointer"
                                    }
                                ),
                                html.Div(id="health-check-output", style={"marginTop": "10px"}),
                            ],
                            style={"padding": "20px"}
                        )
                    ]
                ),
            ],
            style={"padding": "20px"}
        ),
    ],
    style={"fontFamily": "Arial, sans-serif", "maxWidth": "1200px", "margin": "0 auto", "padding": "20px"}
)


# Helper function to format response
def format_response(status_code, data):
    return html.Div(
        [
            html.Div(
                f"Status: {status_code}",
                style={
                    "padding": "10px",
                    "backgroundColor": "#d4edda" if status_code < 400 else "#f8d7da",
                    "color": "#155724" if status_code < 400 else "#721c24",
                    "borderRadius": "4px",
                    "marginBottom": "10px",
                    "fontWeight": "bold"
                }
            ),
            html.Pre(
                json.dumps(data, indent=2),
                style={
                    "backgroundColor": "#f5f5f5",
                    "padding": "15px",
                    "borderRadius": "4px",
                    "overflow": "auto",
                    "maxHeight": "500px"
                }
            )
        ]
    )


# Callbacks for API requests

@callback(
    Output("fetch-topics-output", "children"),
    Input("fetch-topics-btn", "n_clicks"),
    State("api-url-input", "value"),
    prevent_initial_call=True
)
def fetch_topics(n_clicks, api_url):
    try:
        response = requests.get(f"{api_url}/topics", timeout=5)
        return format_response(response.status_code, response.json())
    except Exception as e:
        return html.Div(
            f"Error: {str(e)}",
            style={"padding": "10px", "backgroundColor": "#f8d7da", "color": "#721c24", "borderRadius": "4px"}
        )


@callback(
    Output("create-topic-output", "children"),
    Input("create-topic-btn", "n_clicks"),
    [State("api-url-input", "value"), State("create-topic-id", "value"), State("create-topic-query", "value"), State("create-topic-icon", "value")],
    prevent_initial_call=True
)
def create_topic(n_clicks, api_url, topic_id, query, icon):
    if not all([topic_id, query, icon]):
        return html.Div("All fields are required", style={"padding": "10px", "backgroundColor": "#f8d7da", "color": "#721c24", "borderRadius": "4px"})
    try:
        payload = {"id": topic_id, "query": query, "icon": icon}
        response = requests.post(f"{api_url}/topics", json=payload, timeout=5)
        return format_response(response.status_code, response.json())
    except Exception as e:
        return html.Div(
            f"Error: {str(e)}",
            style={"padding": "10px", "backgroundColor": "#f8d7da", "color": "#721c24", "borderRadius": "4px"}
        )


@callback(
    Output("delete-topic-output", "children"),
    Input("delete-topic-btn", "n_clicks"),
    [State("api-url-input", "value"), State("delete-topic-id", "value")],
    prevent_initial_call=True
)
def delete_topic(n_clicks, api_url, topic_id):
    if not topic_id:
        return html.Div("Topic ID is required", style={"padding": "10px", "backgroundColor": "#f8d7da", "color": "#721c24", "borderRadius": "4px"})
    try:
        response = requests.delete(f"{api_url}/topics/{topic_id}", timeout=5)
        return format_response(response.status_code, response.json())
    except Exception as e:
        return html.Div(
            f"Error: {str(e)}",
            style={"padding": "10px", "backgroundColor": "#f8d7da", "color": "#721c24", "borderRadius": "4px"}
        )


@callback(
    Output("fetch-feed-output", "children"),
    Input("fetch-feed-btn", "n_clicks"),
    State("api-url-input", "value"),
    prevent_initial_call=True
)
def fetch_feed(n_clicks, api_url):
    try:
        response = requests.get(f"{api_url}/feed", timeout=5)
        return format_response(response.status_code, response.json())
    except Exception as e:
        return html.Div(
            f"Error: {str(e)}",
            style={"padding": "10px", "backgroundColor": "#f8d7da", "color": "#721c24", "borderRadius": "4px"}
        )


@callback(
    Output("fetch-archive-output", "children"),
    Input("fetch-archive-btn", "n_clicks"),
    State("api-url-input", "value"),
    prevent_initial_call=True
)
def fetch_archive(n_clicks, api_url):
    try:
        response = requests.get(f"{api_url}/archive", timeout=5)
        return format_response(response.status_code, response.json())
    except Exception as e:
        return html.Div(
            f"Error: {str(e)}",
            style={"padding": "10px", "backgroundColor": "#f8d7da", "color": "#721c24", "borderRadius": "4px"}
        )


@callback(
    Output("archive-article-output", "children"),
    Input("archive-article-btn", "n_clicks"),
    [State("api-url-input", "value"), State("archive-article-id", "value")],
    prevent_initial_call=True
)
def archive_article(n_clicks, api_url, article_id):
    if not article_id:
        return html.Div("Article ID is required", style={"padding": "10px", "backgroundColor": "#f8d7da", "color": "#721c24", "borderRadius": "4px"})
    try:
        response = requests.post(f"{api_url}/articles/{article_id}/archive", timeout=5)
        return format_response(response.status_code, response.json())
    except Exception as e:
        return html.Div(
            f"Error: {str(e)}",
            style={"padding": "10px", "backgroundColor": "#f8d7da", "color": "#721c24", "borderRadius": "4px"}
        )


@callback(
    Output("generate-article-output", "children"),
    Input("generate-article-btn", "n_clicks"),
    [State("api-url-input", "value"), State("generate-topic-id", "value")],
    prevent_initial_call=True
)
def generate_article(n_clicks, api_url, topic_id):
    if not topic_id:
        return html.Div("Topic ID is required", style={"padding": "10px", "backgroundColor": "#f8d7da", "color": "#721c24", "borderRadius": "4px"})
    try:
        response = requests.post(f"{api_url}/generate/{topic_id}", timeout=30)
        return format_response(response.status_code, response.json())
    except Exception as e:
        return html.Div(
            f"Error: {str(e)}",
            style={"padding": "10px", "backgroundColor": "#f8d7da", "color": "#721c24", "borderRadius": "4px"}
        )


@callback(
    Output("health-check-output", "children"),
    Input("health-check-btn", "n_clicks"),
    State("api-url-input", "value"),
    prevent_initial_call=True
)
def health_check(n_clicks, api_url):
    try:
        response = requests.get(f"{api_url}/", timeout=5)
        return format_response(response.status_code, response.json())
    except Exception as e:
        return html.Div(
            f"Error: {str(e)}",
            style={"padding": "10px", "backgroundColor": "#f8d7da", "color": "#721c24", "borderRadius": "4px"}
        )


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=8050)
