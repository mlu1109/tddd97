let chart = document.createElement('div');
chart.className = 'ct-chart ct-golden-section';
chart.id = 'chart';

let pie = document.createElement('div');
pie.id = 'pie';
pie.className = 'ct-chart-pie'

class StatsPage extends React.Component {
    componentDidMount() {
        this.refs.chart.appendChild(chart)
        this.refs.pie.appendChild(pie)
        this.forceUpdate(); // Need to force update since the graphs are not part of React
    }

    componentWillUpdate() {
        let data = this.props.liveData;
        let updateTime = data.time;
        let mapFunction = (entry, index) => {
            return {x: updateTime[index] - updateTime[0], y: entry}
        };
        new Chartist.Line('#chart', {
            series: [
                data.numberOfUsersOnline.map(mapFunction),
                data.numberOfReceivedMessages.map(mapFunction),
                data.numberOfSentMessages.map(mapFunction),
                data.totalNumberOfMessages.map(mapFunction),
            ]
        }, {
            axisX: {onlyInteger: true, type: Chartist.AutoScaleAxis},
            axisY: {onlyInteger: true}
        });

        new Chartist.Pie('#pie', {
                series: [
                    data.totalNumberOfMessages.slice(-1)[0] - data.numberOfReceivedMessages.slice(-1)[0],
                    data.numberOfReceivedMessages.slice(-1)[0]
                ],
                labels: ['Other messages', 'Your received messages']
            }
        );
    }

    render() {
        let chartDiv = React.DOM.div({ref: 'chart'});
        let pieDiv = React.DOM.div({ref: 'pie'});
        return (
            <div className='row'>
                <div className='col-xs-12'>
                    <strong style={{color: 'red'}}>
                        Online users
                    </strong>
                    <strong style={{color: 'green'}}>
                        Received messages
                    </strong>
                    <strong style={{color: 'blue'}}>
                        Sent messages
                    </strong>
                    <strong style={{color: '#D17905'}}>
                        Total messages
                    </strong>
                    {chartDiv}
                </div>
                <div className='col-xs-12'>
                    <strong style={{color: 'red'}}>
                        Other messages
                    </strong>
                    <strong style={{color: 'green'}}>
                        Received messages
                    </strong>
                    {pieDiv}
                </div>
            </div>
        )
    }
}