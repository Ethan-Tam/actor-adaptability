# project_436-visualizers

Data source: https://www.kaggle.com/PromptCloudHQ/imdb-data

External Code sources:
- https://stackoverflow.com/questions/14964035/how-to-export-javascript-array-info-to-csv-on-client-side
- http://bl.ocks.org/mbostock/5100636
- https://observablehq.com/@ericd9799/learning-stacked-bar-chart-in-d3-js

## Milestone 2 Write-Up

### Rationale for Design Choices

1. Data abstraction, connection to interaction aspects and visual encoding choices

  **Network Diagram:**
    - Marks:
      - *Point Mark* - Every actor in this dataset is represented with a node on the network diagram.
    - Channels:
      - *Spatial Positioning* - We used spatial positioning to display the actor's movie genre ratio where the actors that act in primarily action movies will have their representative nodes gravitated towards the "action segment" of the ring in the network diagram. If an actor has only worked in one genre, their node will be placed outside the ring into the affiliated genre.
      - *Colour Hue* - We used colour hue to categorically disguish the different genres. Our rationale for this decision is due to the fact that colour is more effective that using symbols/shapes. We understand that colour hue does not scale well, but since we are only representing 7 different types of genres (which includes "other") we believe that this channel is appropriate. The colour of each node signifies the mode of an actor. That is, the genre they have done the most movies in. If the node is grey, it means that the actor has more than one mode. We used grey instead of combining hues as combining hues may complete mutate the colour to something completely different which may be unintuitive. In addition, if we were to combine the hues, this would create a lot more different colours which is difficult to distunguish and ruins our specified cardinality of 8.
      - *Area (2-D size)* - The actor's node size represents the number of movies they have acted in over the past decade. This distinction, however, is subtle and is merely present to provide the viewer with an overall idea rather than concrete numerical information. This is why we use our other views to display more detailed and quantifiable information about a specific actor. There are 1985 actors in our data.
      - *Line Width* - When an actor is selected/clicked on the network diagram, lines appear which connects to the genres which that specific actor has worked on. The width of the lines indicate the number of movies of that specific genre the actor has been a part of. Similar to node area size, this change is subtle and it is difficult for the user to fully derrive the quantitative information which again presents the need for our other views. There are 3029 links.
    - Interactions/Linkage
      - *Hover (lightweight)* - When a node is hovered, the actor's node becomes higlighted (outlined) and a detail tooltip appears which displays the name of the actor which the node represents. When a genre (ring segment) is hovered it and its name also get highlighted and all the actors that have acted in one or more movies in that given genre are also highlighted.
      - *Click (heavyweight)* - When a node is selected/clicked, the data is filtered by reducing the opacity of all other nodes. Also, more details are shown by lines that connect that specified node to their affiliated genres appear. If a genre (ring segment) is clicked, all lines that connect actors to that specified genre will appear and the data will be filtered by reducing the opacity of the ndoes affiliated with actors not involved in this genre. The other views will change once an actor is selected to show additional information about that specific person. If no actor is selected, the other views (the pie and stacked charts) will  display the overall information of all the actors.

  **Pie Chart:**
    - Marks:
      - *Area* - the area of each slice represents the proportion of movies an actor has done in the genre associated with the slice. See angle channel description for more information.
    - Channels:
      - *Angle* - the total angle of a slice in the pie chart is proportional to the percentage of movies in that specified genre over the past decade. We are aware that this encoding may not be the most effective, but we really wanted to showcase a part to whole relationship which is why we used a pie chart. To further assist the user, we plan on adding labels (but the actual quantity and the percentage) to clarify the values.
      - *Colour Hue* - Used to represent the different genres. This colour encoding is the exactly the same as the network diagram to maintain consistency and avoid confusion. For more details, look at Network Diagram
    - Interaction/Linkage
      - *Hover* - When a slice is hovered, the slice's colour changes to hot pink and its radius increases. Since length or area is not used as a channel in the pie chart, this does not skew what our data represents. When an actor's slice is hovered, the individual line that connects the actor's node to that hovered genre is displayed on the network diagram.
      - *Click* - When a slice is selected, all the other slices will have their opacity reduced (similar to the network diagram) and the line that shows up on over in the network diagram is fixated.

   **Stacked Bar Chart**
    - Marks:
      - *Line Mark* - the length of a bar chart corresponds to a count of movies.
    - Channels:
      - *Hue* - Encodes the "genre" attribute. Colour encoding corresponds to both the network diagram and the pie chart. For more details, see the Network Diagram description.
      - *Horizontal position on a common scale* - encodes the "year" attribute (2006-2016).
      - *Length* - the length of a line mark encodes a count of movies.
    - Interaction/Linkage
      - Currently, the bar chart is unidirectionally linked to the chord diagram, such that when an actor, or a genre, or both are selected, the bar chart shows the correct distribution of movies produced that contain that actor and/or genre throughout the years from 2006-2016.

2. Task abstraction

  - Our visualization aims to help the user realize the different genre of movies a specific actor has played over the past decade. Specifically, the network diagram allows users to browse through different actors and discover unique facts about a given actor, the pie chart will help the user discover the genre distribution of genres for a specific or group of actors, and the stacked bar chart will show the genre trends of each actor over the past decade.

### Original Data Source and Data Prepocessing Pipeline

- As linked above, we got our our original IMDB movies dataset from Kaggle.com. This dataset includes movies' genres, actors, and years produced, among other attributes. Our preprocessing pipeline consists of taking that information and transforming it into different JSON objects that are easier to manipulate and dramatically simplify the coding needed to produce the visualizations. Five JSON files are created as a result of our preprocessing pipeline:
  1. actor-links.json, which contains an array of all the pre-computed links that get displayed when an actor or genre is clicked in the network diagram,
  2. actor-to-genres.json, which contains an array of actors with counts of each genre they've played in,
  3. actor-to-year-genres.json, which contains a dictionary that maps actors to the number of movies of a certain genre the actor played in each year, and
  4. genre-to-actors.json, which contains an array of genres, each with a list of actors that have taken part in them.

### Changes from Proposal

1. Changes in visualization goals
  - **Network Diagram**
    - After talking to TAs and Professor Munzner, our initial chord diagram visualization proved to be ineffective and confusing in acheiving our task. We originally represented each actor with a set of chords (as each individual chord signified a switch in movie genres of a given actor) which is confusing and unintuitive. The chord diagram also does not scale well to our dataset. Even after bundling and setting each movie with a single main genre, it was still extremely difficult to read (Figure 1). We ended up creating something that looked visually appealing by hiding the chords behind a band but it was hacky and still did not resolve our confusing chord mark (Figure 2). Therefore, we have decided to pivot to represent each actor with a node in a network diagram (Figure 3).
      - Figure 1
      - ![](https://p83.f1.n0.cdn.getcloudapp.com/items/qGuob6qw/Image%202020-03-24%20at%202.34.58%20PM.png?v=27677a7d9495ca263d48dcbc20171e1d)
      - Figure 2
      - ![](https://p83.f1.n0.cdn.getcloudapp.com/items/04uK8vQ0/Image%202020-03-24%20at%202.32.49%20PM.png?v=b99edca28791f7ec6293f2c345ea18df)
      - Figure 3
      - ![](https://scontent.fcxh2-1.fna.fbcdn.net/v/t1.15752-9/90441888_225077685353705_6979538906467270656_n.png?_nc_cat=104&_nc_sid=b96e70&_nc_ohc=dlolag6-tT8AX8yiq1k&_nc_ht=scontent.fcxh2-1.fna&oh=739c5853e3b67c55de82398249c03c22&oe=5E9F3015)
  - **Adjacency Matrix, Pyramid Chart, and Barchart tooltip**
    - Upon further discussion, we realize that these views were unique but did not link well with our main chord/network diagram view as there was little to no relationship between these visualizations. In addition, both these visualizations do not scale well and deciding which actors to completely filter out became a daunting task. These intended views also did not align with our task objective of connecting each actor to genres. For these reasons, we have decided to scrap these views and replace them.
  - **Pie Chart**
    - We added a pie chart to show the genre distribution of each actor when a node is a selected. We believe that this linkage is more intuitive than the adjacency matrix while also aligning better with our task.
  - **Stacked Bar Chart**
    - We have decided to replace the movie revenue pyramid chart from the proposal with a stacked bar chart depicting trends in genre popularity over time. The x-axis measures the years from 2006-2016 and the y-axis measures the number of movies produced in a given year. Hue encodes how many movies were produced in a given genre, and the counts for movies of different genres within the same year are stacked one on top of the other. The view connects to the chord diagram, such that when an actor is selected, only the counts for movies that the actor has played in are displayed, and when a genre is selected, only the counts for movies within the selected genre are displayed. It also supports the selection of a genre and an actor, such that only movies played by the selected actor within the selected genre are displayed.
2. Effectiveness of our visualization
  - **Network Diagram**
    - The network diagram allows the user to see all the actors in the data set. It gives a sense of which genres are the most commonly acted in. Using hovering and clicking, one can explore in more detail and see only a specific actor or all the actors that acted in one genre. This visualization is effective in allowing the user to compare different genres. It is harder to compare actors, but that will be made easier by the search functionality that will be implemented later.
  - **Pie Chart**
    - The pie chart is effective in providing a high level understanding of what types of genres an actor has participated in over the past decade. The pie chart also indirectly displays a part-to-whole relationship which we like. It, however, fails to effectively the numerical distribution or quantity of movies in that specified genre. Therefore we are planning to add labels to solve this issue.
  - **Stacked Bar Chart**
    - The stacked bar chart allows the user to clearly see the distribution of movies produced throughout the years, while also informing them as to the distribution of genres of movies produced within a single year. The visualization also allows users to see trends in the popularity of genres year over year. Overall, I would argue this view accomplishes its purpose effectively.

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
  - Reality: 5 hours before scrapping
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
- **Stacked Bar Chart**
  - Estimated: N/A (didn't exist in Milestone 1 proposal)
  - Reality: 20-25 hours
  - Project Lead: Ian
  - Current Status
    - Everything was a new chunk of work, since this view did not exist in our proposal. This includes:
    - Data preprocessing for the view (10 hours)
    - Implementing the view (7 hours)
    - Establishing unidirectional link between the view to the chord diagram (2 hours)
    - Exploring and attempting transitioning between stacked and grouped bar charts (7 hours)
    - Future improvements (Apr 8th): allow users to select bar segments to filter by actor and genre, and set up bidirectional linkage to chord diagram and pie chart to ensure consistency.
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
    - since the barchart tooltip is now scrapped, Ethan will be the lead to implement the previous optional but now essential search functionality
  - Current Status:
    - Not started but has now been made mandatory and part of our core project functionality

### Contributions Breakdown
- As mentioned above, Harlan implemented the chord diagram and worked on data preprocessing. Ian also did some data preprocessing, implemented the stacked bar chart and linked it to the chord diagram. Ethan implemented the pie chart and linked it to the chord diagram, and also did some data preprocessing. Overall, our team feels that the responsibilities were fairly distributed and that equal contribution was achieved.

### Team Process



|                                        | Weak | Satisfactory | Good | Excellent | Specific actions to take to address issues                   |
| -------------------------------------- | ---- | ------------ | :--: | :-------: | ------------------------------------------------------------ |
| Clear vision of the problem(s)         |      |              |      |     X     | No issues, continue to talk to group members, TAs and the professors should any additional issues arise. |
| Good cooperation and organization      |      |              |      |     X     | No issues                                                    |
| Good time management                   |      |              |  X   |           | We need to have more realistic estimates for future tasks. We are on pace to finish the project despite these mistakes. |
| Team acquired needed knowledge base    |      |              |      |     X     | No issues                                                    |
| Efforts communicated well within group |      |              |      |     X     | No issues                                                    |
