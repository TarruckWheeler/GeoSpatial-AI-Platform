import plotly.express as px
import pandas as pd

# Data from the provided JSON
domains = ["Software Architecture", "Geospatial Data Science", "UX/UI Design", "AI/ML Engineering", "Infrastructure", "Community Engagement", "Performance Engineering", "Security & Privacy", "Accessibility"]
expert_counts = [15, 15, 12, 12, 10, 10, 10, 8, 8]
percentages = [15, 15, 12, 12, 10, 10, 10, 8, 8]

# Abbreviate domain names to fit 15 character limit
abbreviated_domains = [
    "Soft Arch",
    "Geospatial", 
    "UX/UI Design",
    "AI/ML Eng",
    "Infrastructure",
    "Community",
    "Performance", 
    "Security",
    "Accessibility"
]

# Create DataFrame
df = pd.DataFrame({
    'domain': abbreviated_domains,
    'count': expert_counts,
    'percentage': percentages
})

# Define colors following the brand color order
colors = ['#1FB8CD', '#FFC185', '#ECEBD5', '#5D878F', '#D2BA4C', 
          '#B4413C', '#964325', '#944454', '#13343B']

# Create pie chart
fig = px.pie(df, 
             values='count', 
             names='domain',
             title='Expert Panel by Domain',
             color_discrete_sequence=colors)

# Update layout for pie chart specifications
fig.update_layout(
    uniformtext_minsize=14, 
    uniformtext_mode='hide'
)

# Update traces to show percentages in labels
fig.update_traces(
    textposition='inside',
    textinfo='percent+label'
)

# Save the chart
fig.write_image('expert_panel_pie_chart.png')