class Pienut {
	constructor(sel_container, width, height){
		this.width = width;
		this.height = height;
		this.color = d3.scaleOrdinal(d3.schemeCategory20);
		this.pie = d3.pie().sort(null).value(d => d.count);
		this.svg = d3.select(sel_container).append("svg")
			.attr("width", (width * 1.1))
			.attr("height", (height * 1.1))
			.append("g");
	
		this.svg.append("g").attr("class", "slices");
		this.svg.append("g").attr("class", "labels");
		this.svg.append("g").attr("class", "lines");
		
		this.radius = Math.min(this.width, this.height)/2;
	}
	
	loadData(data){ this.data = data; }
	
	draw(){
		let lastY = 0,
				lastAdjustment = 0,
				lastSliceRatio = 0;
				
		const total = this.data.reduce((a, b) => a + parseInt((b.count || 0)), 0),
					arc = d3.arc().innerRadius(this.radius*0.55).outerRadius(this.radius*0.30),
					outerArc = d3.arc().outerRadius(this.radius * 0.65).innerRadius(this.radius * 0.65),
					halfPi = Math.PI / 2;
		
		this.svg.attr("transform", "translate(" + ((this.width / 2) + 80) 
			+ "," + ((this.height / 2) + 100) + ")");
		
		this.svg.selectAll('path')
			.data(this.pie(this.data))
			.enter()
			.append('path')
			.attr('d', arc)
			.attr('fill', (d,i)=> this.color(i));
		this.svg.append('circle')
			.attr('r', (this.radius * 0.28))
			.attr('stroke', '#9c9c9c')
			.style('fill', 'transparent');
		this.svg.append('g').classed('labels',true);
		this.svg.append('g').classed('lines',true);
		
		this.svg.select('.lines')
								.selectAll('polyline')
								.data(this.pie(this.data))
								.enter().append('polyline')
								.attr('points', d => {
									const posOne = arc.centroid(d),
												posTwo = outerArc.centroid(d),
												posThree = outerArc.centroid(d),
												xSign = midAngle(d) < Math.PI ? 1 : -1,
												sliceRatio = parseInt(d.data.count) / total;
									
									let extensionLength = 80;
									
									const yDiffAbs = Math.abs(posTwo[1] - lastY + lastAdjustment);
									
									if(lastY && yDiffAbs < 46){
										const riseOverRun = Math.abs(
														(posTwo[1] - posOne[1]) / (posTwo[0] - posOne[0]) 
													);
													
										if(lastSliceRatio < sliceRatio){
											extensionLength = 300;
											lastAdjustment += 20 * xSign;
										} else { lastAdjustment += 40 * xSign; }
										
										posTwo[0] = posTwo[0] + (lastAdjustment / riseOverRun)
										posTwo[1] += lastAdjustment;
									} else { lastAdjustment = 0; }
									
									lastY = posTwo[1];
									lastSliceRatio = sliceRatio;
																		
									posThree[0] = posTwo[0] + (extensionLength * xSign);	
									posThree[1] = posTwo[1];
									
									return [posOne, posTwo, posThree];
								});
								
		lastY = 0;
		lastAdjustment = 0;
		lastSliceRatio = 0;
				
		this.svg.select('.labels')
									.selectAll('text')
									.data(this.pie(this.data))
									.enter().append('text')
									.html(d => {
										const xDiff = midAngle(d) < Math.PI ? '0.5em' : '-0.5em';
										const htmlStr = '<tspan x="0" style="font-weight: bold; font-size: 22px;">' 
											+ d.data.count + '</tspan><tspan y="1em" x="' + xDiff 
											+ '" text-anchor="middle">' 
											+ breakString(d.data.label, xDiff) + '</tspan>';
																				
										return htmlStr;
									})
									.style('text-transform', 'uppercase')
									.attr('transform', d =>{
										const posOne = arc.centroid(d),
													posTwo = outerArc.centroid(d),
													posThree = outerArc.centroid(d),
													xSign = midAngle(d) < Math.PI ? 1 : -1,
													sliceRatio = parseInt(d.data.count) / total;
										
										let extensionLength = 80;			
										
										const yDiffAbs = Math.abs(posTwo[1] - lastY + lastAdjustment);
										
										if(lastY && yDiffAbs < 46){
											const riseOverRun = Math.abs(
												(posTwo[1] - posOne[1]) / (posTwo[0] - posOne[0]) 
											);
											
											if(lastSliceRatio < sliceRatio){
												extensionLength = 300;
												lastAdjustment += 20 * xSign;
											} else { lastAdjustment += 40 * xSign; }
											
											posTwo[0] = posTwo[0] + (lastAdjustment / riseOverRun)
											posTwo[1] += lastAdjustment;
										} else { lastAdjustment = 0; }
										
										lastY = posTwo[1];
										lastSliceRatio = sliceRatio;
										
										posThree[0] = posTwo[0] + ((extensionLength + 10) * xSign);	
										posThree[1] = posTwo[1] + 5;
										
										return 'translate(' + posThree + ')';
									})
									.style('text-anchor', d => {
										return (midAngle(d)) < Math.PI ? 'start' : 'end';
									});
		
		this.svg.append('text').attr('class', 'toolCircle')
			.attr('dy', '0.33em')
			.html(total)
			.style('font-size', '3em')
			.style('font-weight', 'bold')
			.style('text-anchor', 'middle');
		
		function midAngle(d) { return d.startAngle + (d.endAngle - d.startAngle) / 2; }	
		
		function breakString(string, xDiff){
			let i = 0,
					breaks = 0,
					newString = '';
			
			for(const letter of string){
				i++;
				if(i > 12 && letter == ' '){
					breaks ++;
					newString += '</tspan><tspan y="'+ (1 + breaks) 
						+ 'em" x="'+ xDiff +'" text-anchor="middle">';
					i = 0;
				} else { newString += letter; }
			}
			
			return newString;
		}
	}
}