# project_436-visualizers

Data source: https://www.kaggle.com/PromptCloudHQ/imdb-data

External Code sources: https://stackoverflow.com/questions/14964035/how-to-export-javascript-array-info-to-csv-on-client-side http://bl.ocks.org/mbostock/5100636

## Milestone 2 Write-Up

### Rationale for Design Choices

1. Data abstraction, connection to interaction aspects and visual encoding choices

   **Network Diagram:**

   - Marks: 
     - *Point Mark* - Every actor in this dataset is represented with a node on the network diagram. 
   - Channels: 
     - *Spatial Positioning* - We used spatial positioning to display the actor's movie genre ratio where the actors that act in primarily action movies will have their representative nodes gravitated towards the "action segment" of the ring in the network diagram. If an actor has only worked in one genre, their node will be placed outside the ring into the affiliated genre. 
     - *Colour Hue* - We used colour hue to categorically disguish the different genres. Our rationale for this decision is due to the fact that colour is more effective that using symbols/shapes. We understand that colour hue does not scale well, but since we are only representing 7 different types of genres (which includes "other") we believe that this channel is appropriate. The colour of each node signifies the mode of an actor. That is, the genre they have done the most movies in. If the node is grey, it means that the actor has more than one mode. We used grey instead of combining hues as combining hues may complete mutate the colour to something completely different which may be unintuitive. In addition, if we were to combine the hues, this would create a lot more different colours which is difficult to distunguish and ruins our specified cardinality of 8.
     - *Area (2-D size)* - The actor's node size represents the number of movies he/she/they have acted in over the past decade. This distinction, however, is subtle and is merely present to provide the viewer with an overall idea rather than concrete numerical information. This is why we use our other views to display more detailed and quantifiable information about a specific actor. ((TODO ADD RANGE/CARDINALITY)
     - *Line Width* - When an actor is selected/clicked on the network diagram, lines appear which connects to the genres which that specific actor has worked on. The width of the lines indicate the number of movies of that specific genre the actor has been a part of. Similar to node area size, this change is subtle and it is difficult for the user to fully derrive the quantitative information which again presents the need for our other views. (TODO ADD RANGE/CARDINALITY)
   - Interactions/Linkage (TODO - add data-vis Terms)
     - *Hover* - When a node is hovered, the actor's node colour changes to hot pink and a tooltip appears which displays the name of the actor which the node represents. When a genre (ring segment) is hovered its colour also changes to hot pink and all the actors that have acted in one or more movies in that given genre are also highlighted.
     - *Click* - When a node is selected/clicked, the opacity of all other nodes are reduced and lines that connect that specified node to the affiliated genres appear. If a genre (ring segment) is clicked, all lines that connect actors to that specified genre will appear. The other views will change once an actor is selected to show additional information about that specific person. If no actor is selected, the other views (the pie and stacked/grouped charts) will  display the overall information of all the actors. 

   **Pie Chart:**

   - Marks:
     - TODO - what is the mark of a pie chart?
   - Channels:
     - *Angle* - the total angle of a slice in the pie chart is proportional to the percentage of movies in that specified genre over the past decade. We are aware that this encoding may not be the most effective, but we really wanted to showcase a part to whole relationship which is why we used a pie chart. To further assist the user, we plan on adding labels (but the actual quantity and the percentage) to clarify the values.
     - *Colour Hue* - Used to represent the different genres. This colour encoding is the exactly the same as the network diagram to maintain consistency and avoid confusion. For more details, look at Network Diagram
   - Interaction/Linkage
     - *Hover* - When a slice is hovered, the slice's colour changes to hot pink and its radius increases. Since length or area is not used as a channel in the pie chart, this does not skew what our data represents. When an actor's slice is hovered, the individual line that connects the actor's node to that hovered genre is displayed on the network diagram.
     - *Click* - When a slice is selected, all the other slices will have their opacity reduced (similar to the network diagram) and the line that shows up on over in the network diagram is fixated.

   **Stacked/Grouped Bar Chart: TODO**

2. Task abstraction

   - Our visualization aims to help the user realize the different genre of movies a specific actor has played over the past decade. Specifically, the network diagram allows users to browse through different actors and discover unique facts about a given actor, the pie chart will help the user discover the genre distribution of genres for a specific or group of actors, and the stacked/grouped bar chart will show the genre trends of each actor over the past decade.

### Changes from Proposal

1. Changes in visualization goals
   - **Network Diagram**
     - After talking to TAs and Professor Munzner, our initial chord diagram visualization proved to be ineffective and confusing in acheiving our task. We originally represented each actor with a set of chords (as each individual chord signified a switch in movie genres of a given actor) which is confusing and unintuitive. The chord diagram also does not scale well to our dataset. Even after bundling and setting each movie with a single main genre, it was still extremely difficult to read (Figure 1). We ended up creating something that looked visually appealing by hiding the chords behind a band but it was hacky and still did not resolve our confusing chord mark (Figure 2). Therefore, we have decided to pivot to represent each actor with a node in a network diagram (Figure 3).
   - **Adjacency Matrix, Pyramid Chart, and Barchart tooltip**
     - Upon further discussion, we realize that these views were unique but did not link well with our main chord/network diagram view as there was little to no relationship between these visualizations. In addition, both these visualizations do not scale well and deciding which actors to completely filter out became a daunting task. These intended views also did not align with our task objective of connecting each actor to genres. For these reasons, we have decided to scrap these views and replace them.
   - **Pie Chart**
     - We added a pie chart to show the genre distribution of each actor when a node is a selected. We believe that this linkage is more intuitive than the adjacency matrix while also aligning better with our task.
   - **Grouped/Stacked Bar Chart TODO**
2. Effectiveness of our visualization
   - **Network Diagram**
   - **Pie Chart**
     - The pie chart is effective in providing a high level understanding of what types of genres an actor has participated in over the past decade. The pie chart also indirectly displays a part-to-whole relationship which we like. It, however, fails to effectively the numerical distribution or quantity of movies in that specified genre. Therefore we are planning to add labels to solve this issue.

### Status Update

- We have made some major design changes since our project proposal. We hit a lot of walls and adjusted based off of them. Despite these issues, we believe we have made some significant progress and are on pace to complete our intended project.
- The following will only specify the work/status of the coding aspects of our project. Therefore it will not include the time for our milestone write ups for the time being.
- Overall, we realised that our estimates were too conservative as most tasks took longer than expected. Which is fine since we budgeted about 15 hours per person as buffer room.
- **Data Wrangling/Preprocessing**
  - Estimated: 2 hours
  - Reality: 5-6 hours
  - Project Lead: Harlan
  - Current Status: 
    - Completed
- **Genre Chord/Network Diagram View** 
  - Estimated: 12 hours
  - Reality: 16 hours and counting
  - Project Lead: Harlan
  - Current Status: 
    - The original chord diagram was completed within the estimated time frame, but we had to make changes due to the issues we specified previously. 
    - Changed to network diagram
    - The network diagram is almost finished including hover and click events
    - Blocked by the other views that it needs to link together
- **Actor Adjacency Matrix**
  - Estimated: 5 hours
  - Reality: 5hours before scrapping
  - Project Lead: Ethan
  - Current Status: 
    - View is scrapped as described in "Changes in Proposal"
- **Bar Chart Tooltip**
  - Estimated: 5 hours
  - Reality: N/A (scrapped before starting)
  - Project Lead: Ian
  - Current Status: 
    - View is scrapped as described in "Changes in Proposal"
- **Movie Revenue Pyramid Chart View**
  - Estimated: 5 hours
  - Reality: N/A (scrapped before starting)
  - Project Lead: Ian
  - Current Status: 
    - View is scrapped as described in "Changes in Proposal"
- **Stacked/Grouped Bar Chart**
  - Estimated: N/A
  - Reality: N/A
  - Project Lead: Ian
  - Current Status
    - TODO
- **Pie Chart**
  - Estimated: N/A
  - Reality: 12-15 hours
  - Project Lead: Ethan
  - Current Status:  
    - The initial pie chart is complete and is updated once an actor is selected in the network diagram. 
    - Hover effects are completed
    - The bidirectional linking and click events are still in progress
    - Labels will be added shortly
- **Search Functionality**
  - Estimated: 5 hours 
  - Reality: TBD
  - Project Lead: Ethan (originally Ian)
    - since the barchart tooltip is now scrapped, Ethan will be the lead to implement the previous optional but now mandatory search functionality
  - Current Status:
    - Not started but has now been made mandatory and part of our core project functionality

### Contributions Breakdown

### Team Process



|                                        | Weak | Satisfactory | Good | Excellent | Specific actions to take to address issues                   |
| -------------------------------------- | ---- | ------------ | :--: | :-------: | ------------------------------------------------------------ |
| Clear vision of the problem(s)         |      |              |      |     X     | No issues, continue to talk to group members, TAs and the professors should any additional issues arise. |
| Good cooperation and organization      |      |              |      |     X     | No issues                                                    |
| Good time management                   |      |              |  X   |           | We need to have more realistic estimates for future tasks. We are on pace to finish the project despite these mistakes. |
| Team acquired needed knowledge base    |      |              |      |     X     | No issues                                                    |
| Efforts communicated well within group |      |              |      |     X     | No issues                                                    |