import plotly.graph_objects as go
import plotly.io as pio

# Data
categories = ["User Experience & Interface Design", "AI/ML Integration Excellence", "Performance Optimization", "Accessibility & Inclusivity", "Community-Driven Development", "Data Management Excellence", "Emerging Technology Integration"]
importance_scores = [9.2, 8.8, 8.5, 8.1, 7.9, 7.6, 7.3]
expert_votes = [87, 82, 78, 75, 73, 70, 68]

# Abbreviate category names to fit 15-character limit
abbreviated_categories = [
    "UX & Interface",
    "AI/ML Integrat.",
    "Performance",
    "Accessibility", 
    "Community Dev",
    "Data Mgmt",
    "Emerging Tech"
]

# Create horizontal bar chart
fig = go.Figure(go.Bar(
    x=importance_scores,
    y=abbreviated_categories,
    orientation='h',
    marker_color='#1FB8CD',
    hovertemplate='<b>%{y}</b><br>Score: %{x}<br>Votes: %{customdata}<extra></extra>',
    customdata=expert_votes,
    cliponaxis=False
))

# Update layout
fig.update_layout(
    title="Geospatial AI Platform Priorities",
    xaxis_title="Importance",
    yaxis_title=""
)

# Update axes
fig.update_xaxes(range=[0, 10])
fig.update_yaxes(categoryorder='total ascending')

# Save the chart
fig.write_image("priority_rankings_chart.png")