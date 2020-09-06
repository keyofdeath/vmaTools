$(document).ready(function () {

    var $table = $('#table')

    $("#run").click(function () {
        let vma = parseFloat($("#vma").val())

        let p_vma_min = parseInt($("#p_vma_min").val())
        let p_vma_max = parseInt($("#p_vma_max").val())
        let p_vma_step = parseInt($("#p_vma_step").val())

        let min_dist = parseFloat($("#min_dist").val())
        let min_dist_unit = $("#min_dist_unit").val()

        let max_dist = parseFloat($("#max_dist").val())
        let max_dist_unit = $("#max_dist_unit").val()

        let step_dist = parseFloat($("#step_dist").val())
        let step_dist_unit = $("#step_dist_unit").val()

        let vma_array = creat_vma_array(new Speed(vma, CONSTANTS.kilometer_per_hour),
            p_vma_min, p_vma_max, p_vma_step,
            new Distance(min_dist, min_dist_unit),
            new Distance(max_dist, max_dist_unit),
            new Distance(step_dist, step_dist_unit))

        let columns = [{
            title: "%VMA",
            field: "VMA",
            valign: 'middle',
            formatter: function (val) {
                return '<div class="item">' + val + '</div>'
            }
        }]

        let data = []
        let add_columns  = true
        for (const [vma_in_percentage, value] of Object.entries(vma_array)) {
            let row = {}
            for (const [distance_label, time] of Object.entries(value["time"])) {
                // Add header if not set
                if(add_columns)
                {
                    columns.push({
                        title: distance_label,
                        field: distance_label,
                        valign: 'middle',
                        formatter: function (val) {
                            return '<div class="item">' + val + '</div>'
                        }
                    })
                }
                row[distance_label] = time.get_time()
            }
            row["VMA"] = vma_in_percentage + ":" + value["speed_from_percentage_vma"].get_string()
            data.push(row)
            add_columns = false
        }
        $table.bootstrapTable('destroy').bootstrapTable({
            height: 500,
            columns: columns,
            data: data,
            showColumns: true,
            fixedColumns: true,
            fixedNumber: 1
        })
    })
});