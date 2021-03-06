import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {Emoji} from "../emoji";
import {ReportsService} from "./reports.service";
import {AuthService, SocialUser} from "angularx-social-login";
import {environment} from "../../environments/environment";
import * as Chart from 'chart.js';
import {FormControl} from '@angular/forms';
import {MatTabChangeEvent} from '@angular/material';

@Component({
    selector: 'app-reports-component',
    templateUrl: 'reports.component.html',
    styleUrls: ['./reports.component.css'],
})

export class ReportsComponent implements OnInit {
    today = new Date();
    day = this.today.getDate();
    month = this.today.getMonth();
    year = this.today.getFullYear();


    theDay = new Date(this.year, this.month, this.day);
    startDate = new Date(this.year, this.month, this.day);
    endDate = new Date(this.theDay.setDate(this.theDay.getDate() + 1));
    startDate2 = new FormControl(this.startDate);
    endDate2 = new FormControl(this.endDate);
    getDate;

    canvas: any;
    ctx: any;
    myChart: any;
    myPieChart: any;

    public emojis: Emoji[];
    public filteredEmojis: Emoji[];

    public user: SocialUser;

    public emojiMood: number;
    public emojiIntensity: number;
    public inputType;

    private highlightedID: { '$oid': string } = {'$oid': ''};

    // Inject the EmojiListService into this component.
    constructor(public reportsService: ReportsService, public authService: AuthService) {


    }


    isHighlighted(emoji: Emoji): boolean {
        return emoji._id['$oid'] === this.highlightedID['$oid'];
    }



    // These are two mean filter functions
    public filterEmojis(searchMood: number): Emoji[] {
        this.filteredEmojis = this.emojis;

        var today = new Date();
        var day = today.getDate();
        var month = today.getMonth();
        var year = today.getFullYear();
        var theDay = new Date(year, month, day);

        var searchStartDate;
        var searchEndDate;

        if (this.inputType == "This week") {
            var first = theDay.getDate() - theDay.getDay();
            searchStartDate = new Date(theDay.setDate(first)).getTime();
            searchEndDate = new Date(theDay.setDate(theDay.getDate() + 6)).getTime();
        } else if (this.inputType == "Last week") {
            var first = theDay.getDate() - theDay.getDay() - 7;
            searchStartDate = new Date(theDay.setDate(first)).getTime();
            searchEndDate = new Date(theDay.setDate(theDay.getDate() + 6)).getTime();
        } else if (this.inputType == "Last month") {
            theDay.setDate(1);
            searchEndDate = new Date(theDay.setDate(theDay.getDate() - 1)).getTime();
            var count = theDay.getDate() - 1;
            searchStartDate = new Date(theDay.setDate(theDay.getDate() - count)).getTime();
        } else if (this.inputType == "Today") {
            searchStartDate = new Date(year, month, day).getTime();
            searchEndDate = new Date(theDay.setDate(theDay.getDate() + 1)).getTime();
        } else if (this.inputType == "Show All Data") {
            searchStartDate = null;
            searchEndDate = null;
        }

        // Filter by mood
        if (searchMood == null) {
            this.filteredEmojis = this.filteredEmojis.filter(emoji => {
                return true;
            });
        } else {
            this.filteredEmojis = this.filteredEmojis.filter(emoji => {
                return !searchMood || searchMood == emoji.mood;
            })
        }

        // Filter by startDate
        if (searchStartDate == null) {
            this.filteredEmojis = this.filteredEmojis.filter(emoji => {
                return true;
            });
        } else {
            this.filteredEmojis = this.filteredEmojis.filter(emoji => {
                this.getDate = parseInt(emoji.date);
                return this.getDate >= searchStartDate;
            });
        }

        // Filter by endDate
        if (searchEndDate == null) {
            this.filteredEmojis = this.filteredEmojis.filter(emoji => {
                return true;
            });
        } else {
            this.filteredEmojis = this.filteredEmojis.filter(emoji => {
                this.getDate = parseInt(emoji.date);
                return this.getDate <= searchEndDate;
            });
        }

        return this.filteredEmojis;
    }

    public filterEmojisByDate(searchMood: number, searchStartDate: number, searchEndDate: number): Emoji[] {
        this.filteredEmojis = this.emojis;

        // Filter by mood
        if (searchMood == null) {
            this.filteredEmojis = this.filteredEmojis.filter(emoji => {
                return true;
            });
        } else {
            this.filteredEmojis = this.filteredEmojis.filter(emoji => {
                return !searchMood || searchMood == emoji.mood;
            })
        }

        // Filter by startDate
        if (searchStartDate == null) {
            this.filteredEmojis = this.filteredEmojis.filter(emoji => {
                return true;
            });
        } else {
            this.filteredEmojis = this.filteredEmojis.filter(emoji => {
                this.getDate = parseInt(emoji.date);
                return this.getDate >= searchStartDate;
            });
        }

        // Filter by endDate
        if (searchEndDate == null) {
            this.filteredEmojis = this.filteredEmojis.filter(emoji => {
                return true;
            });
        } else {

            this.filteredEmojis = this.filteredEmojis.filter(emoji => {
                this.getDate = parseInt(emoji.date);
                return this.getDate <= searchEndDate;
            });
        }


        return this.filteredEmojis;
    }



    // The following functions do filter for charts
    filterGraph(weekday, filterMood): number {
        var filterData = this.filteredEmojis;


        // Filter by weekday
        if (this.inputType == "Last month") {
            filterData = filterData.filter(emoji => {
                this.getDate = new Date(parseInt(emoji.date));
                return this.getDate.getDate() == weekday;
            });
        } else {
            filterData = filterData.filter(emoji => {

                this.getDate = new Date(parseInt(emoji.date));

                console.log(this.getDate.getDay() + " should be this.getDate day")
                console.log(emoji.date + " this is emoji date")
                console.log(weekday + " this is weekday")
                console.log(this.getDate.getDay() == weekday)
                return this.getDate.getDay() == weekday;
            });
        }
        console.log(filterData.length)
        // Filter by mood
        filterData = filterData.filter(emoji => {
            console.log(emoji.mood)
            console.log(filterMood)
            return !filterMood || emoji.mood == filterMood;
        });

        return filterData.length;
    }

    filterAllEmotions(filterMood): number {
        var filterData = this.filteredEmojis;

        // Filter by mood
        filterData = filterData.filter(emoji => {
            return !filterMood || emoji.mood == filterMood;
        });

        return filterData.length;
    }

    filterForScatter() {
        var filterData;
        var xVal = []; // this will contain the date info
        var yVal = []; // this will contain the intensity info
        var data = [];

        // this will be the final return data array
        data[0] = []; // frustrated_array
        data[1] = []; // worried_array
        data[2] = []; // happy_array
        data[3] = []; // meh_array
        data[4] = []; // unhappy_array


        // Filter by mood
        for (var i = 1; i < 6; i++) {
            filterData = this.filteredEmojis;
            var searchMood = i;
            filterData = filterData.filter(emoji => {
                return !searchMood || searchMood == emoji.mood;
            })
            for (var j = 0; j < filterData.length; j++) {
                xVal.push(parseInt(filterData[j].date));
                yVal.push(filterData[j].intensity);
            }
            for (var k = 0; k < xVal.length; k++) {
                var obj = {x: xVal[k], y: yVal[k]};
                data[i - 1].push(obj);
            }
            xVal = [];
            yVal = [];
        }

        return data;

    }



    // The following functions return specific time range
    getThisWeekDate() {
        var days = [];
        var today = new Date();
        var first = today.getDate() - today.getDay();
        var firstDay = new Date(today.setDate(first));
        days.push(firstDay.getTime());
        var nextDay;
        for (var i = 1; i < 7; i++) {
            nextDay = new Date(today.setDate(today.getDate() + 1));
            days.push(nextDay.getTime());
        }
        return days;
    }

    getLastWeekDate() {
        var days = [];
        var today = new Date();
        var first = today.getDate() - today.getDay() - 7;
        var firstDay = new Date(today.setDate(first));
        days.push(firstDay.getTime());
        var nextDay;
        for (var i = 1; i < 7; i++) {
            nextDay = new Date(today.setDate(today.getDate() + 1));
            days.push(nextDay.getTime());
        }
        return days;
    }

    getLastMonthDate() {
        var days = [];
        var today = new Date();
        today.setDate(1);
        var lastDay = new Date(today.setDate(today.getDate() - 1));
        days.push(lastDay.getTime());
        var preDay;
        var count = today.getDate();
        for (var i = 1; i < count; i++) {
            preDay = new Date(today.setDate(today.getDate() - 1));
            days.push(preDay.getTime());
        }
        days.reverse();
        return days;
    }



    // The following is the updateChart function
    updateChart(): void {

        this.myChart.destroy();

        this.canvas = document.getElementById("myChart");
        this.ctx = this.canvas;

        if (this.inputType == "This week") {
            let frustrated_weekly_totals = {
                "label": "Mad",
                "data": [
                    this.filterGraph('0', 1),
                    this.filterGraph('1', 1),
                    this.filterGraph('2', 1),
                    this.filterGraph('3', 1),
                    this.filterGraph('4', 1),
                    this.filterGraph('5', 1),
                    this.filterGraph('6', 1)
                ],
                hidden: false,
                "fill": false,
                "borderColor": "rgb(204, 0, 0)",
                "lineTension": 0.1
            };

            let worried_weekly_totals = {
                "label": "Worried",
                "data": [
                    this.filterGraph('0', 2),
                    this.filterGraph('1', 2),
                    this.filterGraph('2', 2),
                    this.filterGraph('3', 2),
                    this.filterGraph('4', 2),
                    this.filterGraph('5', 2),
                    this.filterGraph('6', 2)
                ],
                hidden: false,
                "fill": false,
                "borderColor": "rgb(204, 0, 204)",
                "lineTension": 0.1
            };

            let happy_weekly_totals = {
                "label": "Happy",
                "data": [
                    this.filterGraph('0', 3),
                    this.filterGraph('1', 3),
                    this.filterGraph('2', 3),
                    this.filterGraph('3', 3),
                    this.filterGraph('4', 3),
                    this.filterGraph('5', 3),
                    this.filterGraph('6', 3)
                ],
                hidden: false,
                "fill": false,
                "borderColor": "rgb(0, 204, 0)",
                "lineTension": 0.1
            };

            let meh_weekly_totals = {
                "label": "Meh",
                "data": [
                    this.filterGraph('0', 4),
                    this.filterGraph('1', 4),
                    this.filterGraph('2', 4),
                    this.filterGraph('3', 4),
                    this.filterGraph('4', 4),
                    this.filterGraph('5', 4),
                    this.filterGraph('6', 4)
                ],
                hidden: false,
                "fill": false,
                "borderColor": "rgb(96, 96, 96)",
                "lineTension": 0.1
            };

            let unhappy_weekly_totals = {
                "label": "Sad",
                "data": [
                    this.filterGraph('0', 5),
                    this.filterGraph('1', 5),
                    this.filterGraph('2', 5),
                    this.filterGraph('3', 5),
                    this.filterGraph('4', 5),
                    this.filterGraph('5', 5),
                    this.filterGraph('6', 5)
                ],
                hidden: false,
                "fill": false,
                "borderColor": "rgb(0, 102, 204)",
                "lineTension": 0.1
            };

            this.myChart = new Chart(this.ctx, {
                type: 'line',
                data: {
                    labels: this.getThisWeekDate(),
                    datasets: [
                        happy_weekly_totals,
                        unhappy_weekly_totals,
                        meh_weekly_totals,
                        frustrated_weekly_totals,
                        worried_weekly_totals,
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRation: false,
                    scales: {
                        xAxes: [{
                            type: 'time',
                            time: {
                                unit: 'day',
                                unitStepSize: 1,
                                tooltipFormat: "MMM D",
                                round: 'day',
                                displayFormats: {
                                    day: 'MMM D'
                                },
                            },
                        }],
                        yAxes: [{
                            ticks: {
                                beginAtZero: true,
                                stepSize: 1,
                                min: 0
                            }
                        }]
                    }
                }
            });

        } else if (this.inputType == "Last week") {
            let frustrated_weekly_totals = {
                "label": "Mad",
                "data": [
                    this.filterGraph('0', 1),
                    this.filterGraph('1', 1),
                    this.filterGraph('2', 1),
                    this.filterGraph('3', 1),
                    this.filterGraph('4', 1),
                    this.filterGraph('5', 1),
                    this.filterGraph('6', 1)
                ],
                hidden: false,
                "fill": false,
                "borderColor": "rgb(204, 0, 0)",
                "lineTension": 0.1
            };

            let worried_weekly_totals = {
                "label": "Worried",
                "data": [
                    this.filterGraph('0', 2),
                    this.filterGraph('1', 2),
                    this.filterGraph('2', 2),
                    this.filterGraph('3', 2),
                    this.filterGraph('4', 2),
                    this.filterGraph('5', 2),
                    this.filterGraph('6', 2)
                ],
                hidden: false,
                "fill": false,
                "borderColor": "rgb(204, 0, 204)",
                "lineTension": 0.1
            };

            let happy_weekly_totals = {
                "label": "Happy",
                "data": [
                    this.filterGraph('0', 3),
                    this.filterGraph('1', 3),
                    this.filterGraph('2', 3),
                    this.filterGraph('3', 3),
                    this.filterGraph('4', 3),
                    this.filterGraph('5', 3),
                    this.filterGraph('6', 3)
                ],
                hidden: false,
                "fill": false,
                "borderColor": "rgb(0, 204, 0)",
                "lineTension": 0.1
            };

            let meh_weekly_totals = {
                "label": "Meh",
                "data": [
                    this.filterGraph('0', 4),
                    this.filterGraph('1', 4),
                    this.filterGraph('2', 4),
                    this.filterGraph('3', 4),
                    this.filterGraph('4', 4),
                    this.filterGraph('5', 4),
                    this.filterGraph('6', 4)
                ],
                hidden: false,
                "fill": false,
                "borderColor": "rgb(96, 96, 96)",
                "lineTension": 0.1
            };

            let unhappy_weekly_totals = {
                "label": "Sad",
                "data": [
                    this.filterGraph('0', 5),
                    this.filterGraph('1', 5),
                    this.filterGraph('2', 5),
                    this.filterGraph('3', 5),
                    this.filterGraph('4', 5),
                    this.filterGraph('5', 5),
                    this.filterGraph('6', 5)
                ],
                hidden: false,
                "fill": false,
                "borderColor": "rgb(0, 102, 204)",
                "lineTension": 0.1
            };

            this.myChart = new Chart(this.ctx, {
                type: 'line',
                data: {
                    labels: this.getLastWeekDate(),
                    datasets: [
                        happy_weekly_totals,
                        unhappy_weekly_totals,
                        meh_weekly_totals,
                        frustrated_weekly_totals,
                        worried_weekly_totals,
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRation: false,
                    scales: {
                        xAxes: [{
                            type: 'time',
                            time: {
                                unit: 'day',
                                unitStepSize: 1,
                                tooltipFormat: "MMM D",
                                round: 'day',
                                displayFormats: {
                                    day: 'MMM D'
                                },
                            },
                        }],
                        yAxes: [{
                            ticks: {
                                beginAtZero: true,
                                stepSize: 1,
                                min: 0
                            }
                        }]
                    }
                }
            });

        } else if (this.inputType == "Last month") {
            let frustrated_weekly_totals = {
                "label": "Angry",
                "data": [
                    this.filterGraph('1', 1),
                    this.filterGraph('2', 1),
                    this.filterGraph('3', 1),
                    this.filterGraph('4', 1),
                    this.filterGraph('5', 1),
                    this.filterGraph('6', 1),
                    this.filterGraph('7', 1),
                    this.filterGraph('8', 1),
                    this.filterGraph('9', 1),
                    this.filterGraph('10', 1),
                    this.filterGraph('11', 1),
                    this.filterGraph('12', 1),
                    this.filterGraph('13', 1),
                    this.filterGraph('14', 1),
                    this.filterGraph('15', 1),
                    this.filterGraph('16', 1),
                    this.filterGraph('17', 1),
                    this.filterGraph('18', 1),
                    this.filterGraph('19', 1),
                    this.filterGraph('20', 1),
                    this.filterGraph('21', 1),
                    this.filterGraph('22', 1),
                    this.filterGraph('23', 1),
                    this.filterGraph('24', 1),
                    this.filterGraph('25', 1),
                    this.filterGraph('26', 1),
                    this.filterGraph('27', 1),
                    this.filterGraph('28', 1),
                    this.filterGraph('29', 1),
                    this.filterGraph('30', 1),
                    this.filterGraph('31', 1),
                ],
                hidden: false,
                "fill": false,
                "borderColor": "rgb(204, 0, 0)",
                "lineTension": 0.1
            };

            let worried_weekly_totals = {
                "label": "Worried",
                "data": [
                    this.filterGraph('1', 2),
                    this.filterGraph('2', 2),
                    this.filterGraph('3', 2),
                    this.filterGraph('4', 2),
                    this.filterGraph('5', 2),
                    this.filterGraph('6', 2),
                    this.filterGraph('7', 2),
                    this.filterGraph('8', 2),
                    this.filterGraph('9', 2),
                    this.filterGraph('10', 2),
                    this.filterGraph('11', 2),
                    this.filterGraph('12', 2),
                    this.filterGraph('13', 2),
                    this.filterGraph('14', 2),
                    this.filterGraph('15', 2),
                    this.filterGraph('16', 2),
                    this.filterGraph('17', 2),
                    this.filterGraph('18', 2),
                    this.filterGraph('19', 2),
                    this.filterGraph('20', 2),
                    this.filterGraph('21', 2),
                    this.filterGraph('22', 2),
                    this.filterGraph('23', 2),
                    this.filterGraph('24', 2),
                    this.filterGraph('25', 2),
                    this.filterGraph('26', 2),
                    this.filterGraph('27', 2),
                    this.filterGraph('28', 2),
                    this.filterGraph('29', 2),
                    this.filterGraph('30', 2),
                    this.filterGraph('31', 2),
                ],
                hidden: false,
                "fill": false,
                "borderColor": "rgb(204, 0, 204)",
                "lineTension": 0.1
            };

            let happy_weekly_totals = {
                "label": "Happy",
                "data": [
                    this.filterGraph('1', 3),
                    this.filterGraph('2', 3),
                    this.filterGraph('3', 3),
                    this.filterGraph('4', 3),
                    this.filterGraph('5', 3),
                    this.filterGraph('6', 3),
                    this.filterGraph('7', 3),
                    this.filterGraph('8', 3),
                    this.filterGraph('9', 3),
                    this.filterGraph('10', 3),
                    this.filterGraph('11', 3),
                    this.filterGraph('12', 3),
                    this.filterGraph('13', 3),
                    this.filterGraph('14', 3),
                    this.filterGraph('15', 3),
                    this.filterGraph('16', 3),
                    this.filterGraph('17', 3),
                    this.filterGraph('18', 3),
                    this.filterGraph('19', 3),
                    this.filterGraph('20', 3),
                    this.filterGraph('21', 3),
                    this.filterGraph('22', 3),
                    this.filterGraph('23', 3),
                    this.filterGraph('24', 3),
                    this.filterGraph('25', 3),
                    this.filterGraph('26', 3),
                    this.filterGraph('27', 3),
                    this.filterGraph('28', 3),
                    this.filterGraph('29', 3),
                    this.filterGraph('30', 3),
                    this.filterGraph('31', 3),
                ],
                hidden: false,
                "fill": false,
                "borderColor": "rgb(0, 204, 0)",
                "lineTension": 0.1
            };

            let meh_weekly_totals = {
                "label": "Meh",
                "data": [
                    this.filterGraph('1', 4),
                    this.filterGraph('2', 4),
                    this.filterGraph('3', 4),
                    this.filterGraph('4', 4),
                    this.filterGraph('5', 4),
                    this.filterGraph('6', 4),
                    this.filterGraph('7', 4),
                    this.filterGraph('8', 4),
                    this.filterGraph('9', 4),
                    this.filterGraph('10', 4),
                    this.filterGraph('11', 4),
                    this.filterGraph('12', 4),
                    this.filterGraph('13', 4),
                    this.filterGraph('14', 4),
                    this.filterGraph('15', 4),
                    this.filterGraph('16', 4),
                    this.filterGraph('17', 4),
                    this.filterGraph('18', 4),
                    this.filterGraph('19', 4),
                    this.filterGraph('20', 4),
                    this.filterGraph('21', 4),
                    this.filterGraph('22', 4),
                    this.filterGraph('23', 4),
                    this.filterGraph('24', 4),
                    this.filterGraph('25', 4),
                    this.filterGraph('26', 4),
                    this.filterGraph('27', 4),
                    this.filterGraph('28', 4),
                    this.filterGraph('29', 4),
                    this.filterGraph('30', 4),
                    this.filterGraph('31', 4),
                ],
                hidden: false,
                "fill": false,
                "borderColor": "rgb(96, 96, 96)",
                "lineTension": 0.1
            };

            let unhappy_weekly_totals = {
                "label": "Sad",
                "data": [
                    this.filterGraph('1', 5),
                    this.filterGraph('2', 5),
                    this.filterGraph('3', 5),
                    this.filterGraph('4', 5),
                    this.filterGraph('5', 5),
                    this.filterGraph('6', 5),
                    this.filterGraph('7', 5),
                    this.filterGraph('8', 5),
                    this.filterGraph('9', 5),
                    this.filterGraph('10', 5),
                    this.filterGraph('11', 5),
                    this.filterGraph('12', 5),
                    this.filterGraph('13', 5),
                    this.filterGraph('14', 5),
                    this.filterGraph('15', 5),
                    this.filterGraph('16', 5),
                    this.filterGraph('17', 5),
                    this.filterGraph('18', 5),
                    this.filterGraph('19', 5),
                    this.filterGraph('20', 5),
                    this.filterGraph('21', 5),
                    this.filterGraph('22', 5),
                    this.filterGraph('23', 5),
                    this.filterGraph('24', 5),
                    this.filterGraph('25', 5),
                    this.filterGraph('26', 5),
                    this.filterGraph('27', 5),
                    this.filterGraph('28', 5),
                    this.filterGraph('29', 5),
                    this.filterGraph('30', 5),
                    this.filterGraph('31', 5),
                ],
                hidden: false,
                "fill": false,
                "borderColor": "rgb(0, 102, 204)",
                "lineTension": 0.1
            };

            this.myChart = new Chart(this.ctx, {
                type: 'line',
                data: {
                    labels: this.getLastMonthDate(),
                    datasets: [
                        happy_weekly_totals,
                        unhappy_weekly_totals,
                        meh_weekly_totals,
                        frustrated_weekly_totals,
                        worried_weekly_totals,
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRation: false,
                    scales: {
                        xAxes: [{
                            type: 'time',
                            time: {
                                unit: 'day',
                                unitStepSize: 1,
                                tooltipFormat: "MMM D",
                                round: 'day',
                                displayFormats: {
                                    day: 'MMM D'
                                },
                            },
                        }],
                        yAxes: [{
                            ticks: {
                                beginAtZero: true,
                                stepSize: 1,
                                min: 0

                            }
                        }]
                    }
                }
            });

        } else if (this.inputType == "Today") {
            this.buildChart();

        } else if (this.inputType == "Show All Data") {
            this.myChart = new Chart(this.ctx, {
                type: 'pie',
                data: {
                    labels: ["frustrated", "worried", "happy", "meh", "unhappy"],
                    datasets: [{
                        backgroundColor: [
                            "#2ecc71",
                            "#3498db",
                            "#95a5a6",
                            "#9b59b6",
                            "#f1c40f",
                        ],
                        data: [
                            this.filterAllEmotions(1),
                            this.filterAllEmotions(2),
                            this.filterAllEmotions(3),
                            this.filterAllEmotions(4),
                            this.filterAllEmotions(5)
                        ]
                    }]
                }
            });

        }
    }


    buildChart(): void {

        this.canvas = document.getElementById("myChart");
        this.ctx = this.canvas;

        var showData = this.filterForScatter();


        let frustrated_data = {
            "label": "Frustrated",
            "data": showData[0],
            "backgroundColor": "rgb(204, 0, 204)",
            "fill": false,
            "showLine": false,
            "pointRadius": 5,
        };

        let worried_data = {
            "label": "Worried",
            "data": showData[1],
            "backgroundColor": "rgb(204, 204, 0)",
            "fill": false,
            "showLine": false,
            "pointRadius": 5,
        };

        let happy_data = {
            "label": "Happy",
            "data": showData[2],
            "backgroundColor": "rgb(0, 204, 204)",
            "fill": false,
            "showLine": false,
            "pointRadius": 5,
        };

        let meh_data = {
            "label": "Meh",
            "data": showData[3],
            "backgroundColor": "rgb(204, 204, 204)",
            "fill": false,
            "showLine": false,
            "pointRadius": 5,
        };

        let unhappy_data = {
            "label": "Unhappy",
            "data": showData[4],
            "backgroundColor": "rgb(0, 0, 204)",
            "fill": false,
            "showLine": false,
            "pointRadius": 5,
        };


        this.myChart = new Chart(this.ctx, {
            type: 'scatter',
            data: {
                datasets: [
                    frustrated_data,
                    worried_data,
                    happy_data,
                    meh_data,
                    unhappy_data
                ]
            },
            options: {
                scales: {
                    xAxes: [{
                        type: 'time',
                        distribution: 'linear',
                        time: {
                            unit: 'minute',
                            unitStepSize: 60,
                            displayFormats: {
                                minute: 'h:mm a',
                            },
                        }
                    }],
                    yAxes: [{
                        ticks: {
                            min: 0,
                            max: 3,
                            beginAtZero: true,
                            stepSize: 1,
                        }
                    }]
                }
            }
        });

    }

    buildPieChart(): void {

        this.canvas = document.getElementById("Pie");
        this.ctx = this.canvas;

        this.myPieChart = new Chart(this.ctx, {
            type: 'pie',
            data: {
                labels: ["frustrated", "worried", "happy", "meh", "unhappy"],
                datasets: [{
                    backgroundColor: [
                        "#2ecc71",
                        "#3498db",
                        "#95a5a6",
                        "#9b59b6",
                        "#f1c40f",
                    ],
                    data: [
                        this.filterAllEmotions(1),
                        this.filterAllEmotions(2),
                        this.filterAllEmotions(3),
                        this.filterAllEmotions(4),
                        this.filterAllEmotions(5)
                    ]
                }]
            }
        });

    }


    ngAfterViewInit(): void {
        this.buildChart();
    }

    /**
     * Starts an asynchronous operation to update the emojis list
     *
     */
    refreshEmojis(): Observable<Emoji[]> {
        // Get Emojis returns an Observable, basically a "promise" that
        // we will get the data from the server.
        //
        // Subscribe waits until the data is fully downloaded, then
        // performs an action on it (the first lambda)
        //if (this.inputType ==
        const emojiListObservable: Observable<Emoji[]> = this.reportsService.getEmojis(localStorage.getItem('userId'));
        emojiListObservable.subscribe(
            emojis => {
                this.emojis = emojis;
            },
            err => {
                console.log(err);
            });
        return emojiListObservable;

    }

    public tabChanged(tabChangeEvent: MatTabChangeEvent): void {
        console.log(tabChangeEvent.tab.textLabel);
        this.buildPieChart()
    }


    ngOnInit(): void {
        if (environment.envName != 'e2e') {
            this.authService.authState.subscribe((user) => {
                this.user = user;
            });

        } else {
            // run this code during e2e testing
            // so that we don't have to sign in
            this.user = {
                provider: '',
                id: '',
                email: 'sunshine@test.com',
                name: 'test dummy',
                photoUrl: '',
                firstName: 'test',
                lastName: 'dummy',
                authToken: '',
                idToken: 'testToken',

            };
        }
        this.refreshEmojis();
    }

    public getReadableDate(dateString: string): string {
        if (dateString == '') {
            return '';

        }
        const date = new Date(parseInt(dateString));

        return (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear() + ' ' + date.getHours() + ':'
            + date.getMinutes();
    }

    totalNumberMoods(): number {
        return this.filteredEmojis.length;
    }

}
