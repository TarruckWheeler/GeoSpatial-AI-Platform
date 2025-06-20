import plotly.graph_objects as go
import plotly.express as px
import json

# Load the data
data = {
    "phases": [
        {"name": "Phase 1: Foundation", "start_month": 1, "end_month": 3, "status": "completed", "progress": 100, "key_deliverables": ["User Research", "Architecture Design", "AI Model Selection", "Accessibility Framework"]}, 
        {"name": "Phase 2: Core Development", "start_month": 4, "end_month": 6, "status": "completed", "progress": 100, "key_deliverables": ["Interface Redesign", "Performance Optimization", "Real-time Processing", "Feedback System"]}, 
        {"name": "Phase 3: Advanced Features", "start_month": 7, "end_month": 9, "status": "in_progress", "progress": 75, "key_deliverables": ["AI Explainability", "Collaboration Tools", "Mobile Optimization", "Advanced Visualization"]}, 
        {"name": "Phase 4: Launch Preparation", "start_month": 10, "end_month": 12, "status": "planned", "progress": 0, "key_deliverables": ["Security Audits", "Beta Testing", "Documentation", "Global Deployment"]}
    ]
}

# Define colors for different statuses
color_map = {
    'completed': '#1FB8CD',  # Strong cyan
    'in_progress': '#FFC185',  # Light orange
    'planned': '#ECEBD5'  # Light green
}

# Create the Gantt chart
fig = go.Figure()

# Track which statuses have been added to legend
legend_added = set()

# Add bars for each phase
for i, phase in enumerate(data['phases']):
    # Better phase names within 15 char limit
    phase_names = ['Phase 1: Found', 'Phase 2: Core Dev', 'Phase 3: Adv Feat', 'Phase 4: Launch']
    
    duration = phase['end_month'] - phase['start_month'] + 1
    
    # Create concise deliverables list for hover
    deliverables_short = [d[:12] + '...' if len(d) > 12 else d for d in phase['key_deliverables'][:4]]
    deliverables_text = '<br>'.join(['• ' + d for d in deliverables_short])
    
    # Enhanced hover text
    status_display = phase['status'].replace('_', ' ').title()
    if phase['status'] == 'in_progress':
        status_display += f" ({phase['progress']}%)"
    
    hover_text = f"<b>{phase['name']}</b><br>Duration: M{phase['start_month']}-{phase['end_month']}<br>Status: {status_display}<br><br>Key Deliverables:<br>{deliverables_text}"
    
    # For in-progress phase, show completed and remaining portions
    if phase['status'] == 'in_progress':
        # Completed portion
        completed_duration = duration * (phase['progress'] / 100)
        fig.add_trace(go.Bar(
            y=[phase_names[i]],
            x=[completed_duration],
            base=[phase['start_month'] - 1],
            orientation='h',
            marker_color='#5D878F',  # Darker cyan for completed progress
            name='In Progress' if 'in_progress' not in legend_added else '',
            hovertemplate=hover_text + '<extra></extra>',
            showlegend='in_progress' not in legend_added
        ))
        legend_added.add('in_progress')
        
        # Remaining portion
        remaining_duration = duration - completed_duration
        fig.add_trace(go.Bar(
            y=[phase_names[i]],
            x=[remaining_duration],
            base=[phase['start_month'] - 1 + completed_duration],
            orientation='h',
            marker_color='#FFC185',  # Light orange for remaining
            marker_pattern_shape='/',  # Pattern to show it's remaining
            name='',
            hovertemplate=f"<b>Remaining: {100-phase['progress']}%</b><extra></extra>",
            showlegend=False
        ))
    else:
        # Regular bar for completed/planned phases
        show_in_legend = phase['status'] not in legend_added
        fig.add_trace(go.Bar(
            y=[phase_names[i]],
            x=[duration],
            base=[phase['start_month'] - 1],
            orientation='h',
            marker_color=color_map[phase['status']],
            name=phase['status'].replace('_', ' ').title(),
            hovertemplate=hover_text + '<extra></extra>',
            showlegend=show_in_legend
        ))
        legend_added.add(phase['status'])

# Add text annotations for key deliverables
for i, phase in enumerate(data['phases']):
    phase_names = ['Phase 1: Found', 'Phase 2: Core Dev', 'Phase 3: Adv Feat', 'Phase 4: Launch']
    
    # Show first 2 key deliverables as text
    key_items = phase['key_deliverables'][:2]
    deliverable_text = ' • '.join([d[:8] + '...' if len(d) > 8 else d for d in key_items])
    
    # Position text in middle of phase duration
    mid_point = phase['start_month'] + (phase['end_month'] - phase['start_month']) / 2 - 1
    
    fig.add_annotation(
        x=mid_point,
        y=i,
        text=deliverable_text,
        showarrow=False,
        font=dict(size=9, color='white'),
        bgcolor='rgba(0,0,0,0.3)',
        bordercolor='rgba(0,0,0,0.5)',
        borderwidth=1
    )

# Update layout
fig.update_layout(
    title='Geospatial AI Roadmap',
    xaxis_title='Months',
    yaxis_title='Phase',
    barmode='overlay',
    legend=dict(orientation='h', yanchor='bottom', y=1.05, xanchor='center', x=0.5)
)

# Update axes
fig.update_xaxes(
    tickmode='linear',
    tick0=1,
    dtick=1,
    range=[0, 13]
)

fig.update_yaxes()

# Save the chart
fig.write_image('gantt_chart.png')