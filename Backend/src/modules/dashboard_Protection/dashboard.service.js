// // services/dashboard.service.js
// const { pool } = require("../../configs/database.config");

// const getGuardDashboardStats = async (guardUserId, buildingId = null) => {
//   // 1. Tổng số lượt quét hôm nay (theo giờ Việt Nam)
//  const totalScansTodayQuery = `
//     SELECT COUNT(*) as total
//     FROM access_logs al
//     WHERE al.scanned_by = $1
//     AND (al.scan_time AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh')::date = 
//         (NOW() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date
//   `;
//   const totalScansToday = await pool.query(totalScansTodayQuery, [guardUserId]);

//   // 2. Tỷ lệ thành công hôm nay
//   const successRateQuery = `
//     SELECT 
//       COUNT(*) as total,
//       SUM(CASE WHEN al.result = 'SUCCESS' THEN 1 ELSE 0 END) as success_count
//     FROM access_logs al
//     WHERE al.scanned_by = $1
//     AND (al.scan_time AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh')::date = 
//         (NOW() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date
//   `;
//   const successRate = await pool.query(successRateQuery, [guardUserId]);
//   const successPercent = successRate.rows[0].total > 0 
//     ? (successRate.rows[0].success_count / successRate.rows[0].total * 100).toFixed(1)
//     : 0;

//   // 3. Số lượt từ chối hôm nay
//   const deniedCountQuery = `
//     SELECT COUNT(*) as total
//     FROM access_logs al
//     WHERE al.scanned_by = $1
//     AND al.result = 'DENIED'
//     AND (al.scan_time AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh')::date = CURRENT_DATE
//   `;
//   const deniedCount = await pool.query(deniedCountQuery, [guardUserId]);

//   // 4. Giờ cao điểm (giờ có nhiều lượt quét nhất)
//   const peakHourQuery = `
//     SELECT 
//       EXTRACT(HOUR FROM (al.scan_time AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh')) as hour,
//       COUNT(*) as count
//     FROM access_logs al
//     WHERE al.scanned_by = $1
//     AND al.scan_time >= (NOW() AT TIME ZONE 'Asia/Ho_Chi_Minh' - INTERVAL '30 days') AT TIME ZONE 'Asia/Ho_Chi_Minh' AT TIME ZONE 'UTC'
//     GROUP BY hour
//     ORDER BY count DESC
//     LIMIT 1
//   `;
//   const peakHour = await pool.query(peakHourQuery, [guardUserId]);

//   // 5. Lưu lượng quét theo giờ (24h gần nhất)
//   const hourlyStatsQuery = `
//     SELECT 
//       EXTRACT(HOUR FROM (al.scan_time AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh')) as hour,
//       COUNT(*) as count
//     FROM access_logs al
//     WHERE al.scanned_by = $1
//     AND al.scan_time >= (NOW() AT TIME ZONE 'Asia/Ho_Chi_Minh' - INTERVAL '24 hours') AT TIME ZONE 'Asia/Ho_Chi_Minh' AT TIME ZONE 'UTC'
//     GROUP BY hour
//     ORDER BY hour ASC
//   `;
//   const hourlyStats = await pool.query(hourlyStatsQuery, [guardUserId]);

//   // 6. Phân bổ theo tòa nhà
//   const buildingDistributionQuery = `
//     SELECT 
//       COALESCE(b.name, 'Không xác định') as building_name,
//       COUNT(*) as count
//     FROM access_logs al
//     LEFT JOIN buildings b ON b.id = al.building_id
//     WHERE al.scanned_by = $1
//     AND al.scan_time >= NOW() - INTERVAL '30 days'
//     GROUP BY b.id, b.name
//     ORDER BY count DESC
//   `;
//   const buildingDistribution = await pool.query(buildingDistributionQuery, [guardUserId]);

//   // 7. Mã QR bị từ chối nhiều nhất
//   const topDeniedQrQuery = `
//     SELECT 
//       COALESCE(gq.qr_code, pq.qr_code) as qr_code,
//       COUNT(*) as attempt_count,
//       MAX(al.gate) as gate,
//       MIN(COALESCE(al.snapshot_visitor_name, v.name, u.full_name, 'Không xác định')) as visitor_name
//     FROM access_logs al
//     LEFT JOIN guest_qr_codes gq ON gq.id = al.qr_code_id
//     LEFT JOIN qr_codes pq ON pq.id = al.personal_qr_code_id
//     LEFT JOIN visitors v ON v.id = gq.visitor_id
//     LEFT JOIN users u ON u.id = COALESCE(gq.host_user_id, pq.user_id)
//     WHERE al.scanned_by = $1
//     AND al.result = 'DENIED'
//     AND al.scan_time >= NOW() - INTERVAL '7 days'
//     GROUP BY COALESCE(gq.qr_code, pq.qr_code)
//     ORDER BY attempt_count DESC
//     LIMIT 5
//   `;
//   const topDeniedQr = await pool.query(topDeniedQrQuery, [guardUserId]);

//   // 8. Hoạt động bất thường
//   const anomaliesQuery = `
//     WITH scan_gaps AS (
//       SELECT 
//         COALESCE(al.qr_code_id, al.personal_qr_code_id) as qr_id,
//         al.scan_time,
//         LAG(al.scan_time) OVER (PARTITION BY COALESCE(al.qr_code_id, al.personal_qr_code_id) ORDER BY al.scan_time) as prev_scan_time
//       FROM access_logs al
//       WHERE al.scanned_by = $1
//       AND al.scan_time >= NOW() - INTERVAL '7 days'
//     ),
//     grouped_scans AS (
//       SELECT 
//         qr_id,
//         COUNT(*) as scan_count,
//         MIN(scan_time) as first_scan,
//         MAX(scan_time) as last_scan
//       FROM scan_gaps sg
//       WHERE sg.prev_scan_time IS NOT NULL
//       AND EXTRACT(EPOCH FROM (sg.scan_time - sg.prev_scan_time)) < 120
//       GROUP BY qr_id
//       HAVING COUNT(*) >= 3
//     )
//     SELECT 
//       COALESCE(gq.qr_code, pq.qr_code) as qr_code,
//       gs.scan_count,
//       gs.first_scan,
//       gs.last_scan,
//       MIN(COALESCE(al.snapshot_visitor_name, v.name, u.full_name, 'Không xác định')) as visitor_name
//     FROM grouped_scans gs
//     LEFT JOIN access_logs al ON al.qr_code_id = gs.qr_id OR al.personal_qr_code_id = gs.qr_id
//     LEFT JOIN guest_qr_codes gq ON gq.id = gs.qr_id
//     LEFT JOIN qr_codes pq ON pq.id = gs.qr_id
//     LEFT JOIN visitors v ON v.id = gq.visitor_id
//     LEFT JOIN users u ON u.id = COALESCE(gq.host_user_id, pq.user_id)
//     GROUP BY gq.qr_code, pq.qr_code, gs.scan_count, gs.first_scan, gs.last_scan
//     LIMIT 5
//   `;
//   const anomalies = await pool.query(anomaliesQuery, [guardUserId]);

//   // 9. Nhật ký quét gần đây
//   const recentLogsQuery = `
//     SELECT 
//       al.id,
//       al.scan_time,
//       al.direction,
//       al.gate,
//       al.result,
//       al.snapshot_visitor_name as visitor_name,
//       COALESCE(gq.qr_code, pq.qr_code) as qr_code,
//       a.apartment_code,
//       CASE 
//         WHEN al.qr_code_id IS NOT NULL THEN 'guest'
//         ELSE 'personal'
//       END as qr_type
//     FROM access_logs al
//     LEFT JOIN guest_qr_codes gq ON gq.id = al.qr_code_id
//     LEFT JOIN qr_codes pq ON pq.id = al.personal_qr_code_id
//     LEFT JOIN apartments a ON a.id = COALESCE(gq.apartment_id, pq.apartment_id)
//     WHERE al.scanned_by = $1
//     ORDER BY al.scan_time DESC
//     LIMIT 10
//   `;
//   const recentLogs = await pool.query(recentLogsQuery, [guardUserId]);

//   // 10. Thống kê tổng quan
//   const overviewStatsQuery = `
//     SELECT 
//       COUNT(DISTINCT user_id) as active_residents,
//       COUNT(CASE WHEN source = 'personal' THEN 1 END) as personal_qr_count,
//       COUNT(CASE WHEN source = 'guest' THEN 1 END) as guest_qr_count
//     FROM (
//       SELECT user_id, 'personal' as source FROM qr_codes WHERE status = 'ACTIVE'
//       UNION ALL
//       SELECT host_user_id as user_id, 'guest' as source FROM guest_qr_codes WHERE status = 'ACTIVE'
//     ) as active_qrs
//   `;
//   const overviewStats = await pool.query(overviewStatsQuery);

//   // Format dữ liệu cho biểu đồ theo giờ
//   const hourlyData = Array(24).fill(0);
//   hourlyStats.rows.forEach(row => {
//     const hour = parseInt(row.hour);
//     hourlyData[hour] = parseInt(row.count);
//   });

//   // Format phân bổ tòa nhà
//   const buildingData = buildingDistribution.rows.map(row => ({
//     name: row.building_name || 'Không xác định',
//     percentage: row.count
//   }));
  
//   const totalBuildingScans = buildingDistribution.rows.reduce((sum, row) => sum + parseInt(row.count), 0);
//   buildingData.forEach(item => {
//     item.percentage = totalBuildingScans > 0 ? ((parseFloat(item.percentage) / totalBuildingScans) * 100).toFixed(1) : 0;
//   });

//   return {
//     overview: {
//       totalScansToday: parseInt(totalScansToday.rows[0]?.total || 0),
//       successRate: parseFloat(successPercent),
//       deniedCount: parseInt(deniedCount.rows[0]?.total || 0),
//       peakHour: peakHour.rows[0]?.hour ? `${String(peakHour.rows[0].hour).padStart(2, '0')}:00 - ${String(parseInt(peakHour.rows[0].hour) + 1).padStart(2, '0')}:00` : 'Chưa có dữ liệu',
//       peakHourCount: parseInt(peakHour.rows[0]?.count || 0)
//     },
//     charts: {
//       hourlyStats: hourlyData,
//       buildingDistribution: buildingData
//     },
//     alerts: {
//       topDeniedQr: topDeniedQr.rows || [],
//       anomalies: anomalies.rows || []
//     },
//     recentLogs: recentLogs.rows.map(log => ({
//       id: log.id,
//       time: log.scan_time,
//       visitorName: log.visitor_name || 'Không xác định',
//       apartmentCode: log.apartment_code || '---',
//       result: log.result,
//       gate: log.gate || 'Cổng chính',
//       qrType: log.qr_type
//     })),
//     stats: {
//       activeResidents: parseInt(overviewStats.rows[0]?.active_residents || 0),
//       personalQrCount: parseInt(overviewStats.rows[0]?.personal_qr_count || 0),
//       guestQrCount: parseInt(overviewStats.rows[0]?.guest_qr_count || 0)
//     }
//   };
// };

// module.exports = { getGuardDashboardStats };

// services/dashboard.service.js
const { pool } = require("../../configs/database.config");

const getGuardDashboardStats = async (guardUserId, buildingId = null) => {
  // 1. Tổng số lượt quét hôm nay (theo giờ Việt Nam)
  const totalScansTodayQuery = `
    SELECT COUNT(*) as total
    FROM access_logs al
    WHERE al.scanned_by = $1
    AND (al.scan_time AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh')::date = 
        (NOW() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date
  `;
  const totalScansToday = await pool.query(totalScansTodayQuery, [guardUserId]);

  // 2. Tỷ lệ thành công hôm nay (theo giờ Việt Nam)
  const successRateQuery = `
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN al.result = 'SUCCESS' THEN 1 ELSE 0 END) as success_count
    FROM access_logs al
    WHERE al.scanned_by = $1
    AND (al.scan_time AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh')::date = 
        (NOW() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date
  `;
  const successRate = await pool.query(successRateQuery, [guardUserId]);
  const successPercent = successRate.rows[0].total > 0 
    ? (successRate.rows[0].success_count / successRate.rows[0].total * 100).toFixed(1)
    : 0;

  // 3. Số lượt từ chối hôm nay (theo giờ Việt Nam)
  const deniedCountQuery = `
    SELECT COUNT(*) as total
    FROM access_logs al
    WHERE al.scanned_by = $1
    AND al.result = 'DENIED'
    AND (al.scan_time AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh')::date = 
        (NOW() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date
  `;
  const deniedCount = await pool.query(deniedCountQuery, [guardUserId]);

  // 4. Giờ cao điểm (giờ có nhiều lượt quét nhất, theo giờ VN, 30 ngày gần nhất)
  const peakHourQuery = `
    SELECT 
      EXTRACT(HOUR FROM (al.scan_time AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh')) as hour,
      COUNT(*) as count
    FROM access_logs al
    WHERE al.scanned_by = $1
    AND al.scan_time >= (NOW() AT TIME ZONE 'Asia/Ho_Chi_Minh' - INTERVAL '30 days') AT TIME ZONE 'Asia/Ho_Chi_Minh' AT TIME ZONE 'UTC'
    GROUP BY hour
    ORDER BY count DESC
    LIMIT 1
  `;
  const peakHour = await pool.query(peakHourQuery, [guardUserId]);

  // 5. Lưu lượng quét theo giờ (24h gần nhất, theo giờ VN)
  // const hourlyStatsQuery = `
  //   SELECT 
  //     EXTRACT(HOUR FROM (al.scan_time AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh')) as hour,
  //     COUNT(*) as count
  //   FROM access_logs al
  //   WHERE al.scanned_by = $1
  //   AND al.scan_time >= (NOW() AT TIME ZONE 'Asia/Ho_Chi_Minh' - INTERVAL '24 hours') AT TIME ZONE 'Asia/Ho_Chi_Minh' AT TIME ZONE 'UTC'
  //   GROUP BY hour
  //   ORDER BY hour ASC
  // `;

  const hourlyStatsQuery = `
  SELECT 
    EXTRACT(HOUR FROM (al.scan_time AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh')) as hour,
    COUNT(*) as count
  FROM access_logs al
  WHERE al.scanned_by = $1
  AND al.scan_time >= (NOW() AT TIME ZONE 'Asia/Ho_Chi_Minh' - INTERVAL '24 hours') AT TIME ZONE 'Asia/Ho_Chi_Minh' AT TIME ZONE 'UTC'
  GROUP BY hour
  ORDER BY hour ASC
`;
  const hourlyStats = await pool.query(hourlyStatsQuery, [guardUserId]);

  // 6. Phân bổ theo tòa nhà (30 ngày gần nhất, theo giờ VN)
  const buildingDistributionQuery = `
    SELECT 
      COALESCE(b.name, 'Không xác định') as building_name,
      COUNT(*) as count
    FROM access_logs al
    LEFT JOIN buildings b ON b.id = al.building_id
    WHERE al.scanned_by = $1
    AND al.scan_time >= (NOW() AT TIME ZONE 'Asia/Ho_Chi_Minh' - INTERVAL '30 days') AT TIME ZONE 'Asia/Ho_Chi_Minh' AT TIME ZONE 'UTC'
    GROUP BY b.id, b.name
    ORDER BY count DESC
  `;
  const buildingDistribution = await pool.query(buildingDistributionQuery, [guardUserId]);

  // 7. Mã QR bị từ chối nhiều nhất (7 ngày gần nhất, theo giờ VN)
  const topDeniedQrQuery = `
    SELECT 
      COALESCE(gq.qr_code, pq.qr_code) as qr_code,
      COUNT(*) as attempt_count,
      MAX(al.gate) as gate,
      MIN(COALESCE(al.snapshot_visitor_name, v.name, u.full_name, 'Không xác định')) as visitor_name
    FROM access_logs al
    LEFT JOIN guest_qr_codes gq ON gq.id = al.qr_code_id
    LEFT JOIN qr_codes pq ON pq.id = al.personal_qr_code_id
    LEFT JOIN visitors v ON v.id = gq.visitor_id
    LEFT JOIN users u ON u.id = COALESCE(gq.host_user_id, pq.user_id)
    WHERE al.scanned_by = $1
    AND al.result = 'DENIED'
    AND al.scan_time >= (NOW() AT TIME ZONE 'Asia/Ho_Chi_Minh' - INTERVAL '7 days') AT TIME ZONE 'Asia/Ho_Chi_Minh' AT TIME ZONE 'UTC'
    GROUP BY COALESCE(gq.qr_code, pq.qr_code)
    ORDER BY attempt_count DESC
    LIMIT 5
  `;
  const topDeniedQr = await pool.query(topDeniedQrQuery, [guardUserId]);

  // 8. Hoạt động bất thường (7 ngày gần nhất, theo giờ VN)
  const anomaliesQuery = `
    WITH scan_gaps AS (
      SELECT 
        COALESCE(al.qr_code_id, al.personal_qr_code_id) as qr_id,
        al.scan_time,
        LAG(al.scan_time) OVER (PARTITION BY COALESCE(al.qr_code_id, al.personal_qr_code_id) ORDER BY al.scan_time) as prev_scan_time
      FROM access_logs al
      WHERE al.scanned_by = $1
      AND al.scan_time >= (NOW() AT TIME ZONE 'Asia/Ho_Chi_Minh' - INTERVAL '7 days') AT TIME ZONE 'Asia/Ho_Chi_Minh' AT TIME ZONE 'UTC'
    ),
    grouped_scans AS (
      SELECT 
        qr_id,
        COUNT(*) as scan_count,
        MIN(scan_time) as first_scan,
        MAX(scan_time) as last_scan
      FROM scan_gaps sg
      WHERE sg.prev_scan_time IS NOT NULL
      AND EXTRACT(EPOCH FROM (sg.scan_time - sg.prev_scan_time)) < 120
      GROUP BY qr_id
      HAVING COUNT(*) >= 3
    )
    SELECT 
      COALESCE(gq.qr_code, pq.qr_code) as qr_code,
      gs.scan_count,
      gs.first_scan,
      gs.last_scan,
      MIN(COALESCE(al.snapshot_visitor_name, v.name, u.full_name, 'Không xác định')) as visitor_name
    FROM grouped_scans gs
    LEFT JOIN access_logs al ON al.qr_code_id = gs.qr_id OR al.personal_qr_code_id = gs.qr_id
    LEFT JOIN guest_qr_codes gq ON gq.id = gs.qr_id
    LEFT JOIN qr_codes pq ON pq.id = gs.qr_id
    LEFT JOIN visitors v ON v.id = gq.visitor_id
    LEFT JOIN users u ON u.id = COALESCE(gq.host_user_id, pq.user_id)
    GROUP BY gq.qr_code, pq.qr_code, gs.scan_count, gs.first_scan, gs.last_scan
    LIMIT 5
  `;
  const anomalies = await pool.query(anomaliesQuery, [guardUserId]);

  // 9. Nhật ký quét gần đây (10 bản ghi mới nhất, hiển thị giờ VN)
  const recentLogsQuery = `
    SELECT 
      al.id,
      (al.scan_time AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh') as scan_time,
      al.direction,
      al.gate,
      al.result,
      al.snapshot_visitor_name as visitor_name,
      COALESCE(gq.qr_code, pq.qr_code) as qr_code,
      a.apartment_code,
      CASE 
        WHEN al.qr_code_id IS NOT NULL THEN 'guest'
        ELSE 'personal'
      END as qr_type
    FROM access_logs al
    LEFT JOIN guest_qr_codes gq ON gq.id = al.qr_code_id
    LEFT JOIN qr_codes pq ON pq.id = al.personal_qr_code_id
    LEFT JOIN apartments a ON a.id = COALESCE(gq.apartment_id, pq.apartment_id)
    WHERE al.scanned_by = $1
    ORDER BY al.scan_time DESC
    LIMIT 10
  `;
  const recentLogs = await pool.query(recentLogsQuery, [guardUserId]);

  // 10. Thống kê tổng quan
  const overviewStatsQuery = `
    SELECT 
      COUNT(DISTINCT user_id) as active_residents,
      COUNT(CASE WHEN source = 'personal' THEN 1 END) as personal_qr_count,
      COUNT(CASE WHEN source = 'guest' THEN 1 END) as guest_qr_count
    FROM (
      SELECT user_id, 'personal' as source FROM qr_codes WHERE status = 'ACTIVE'
      UNION ALL
      SELECT host_user_id as user_id, 'guest' as source FROM guest_qr_codes WHERE status = 'ACTIVE'
    ) as active_qrs
  `;
  const overviewStats = await pool.query(overviewStatsQuery);

  // Format dữ liệu cho biểu đồ theo giờ (24h từ 0-23 giờ VN)
  const hourlyData = Array(24).fill(0);
  hourlyStats.rows.forEach(row => {
    const hour = parseInt(row.hour);
    hourlyData[hour] = parseInt(row.count);
  });

  // Format phân bổ tòa nhà
  const buildingData = buildingDistribution.rows.map(row => ({
    name: row.building_name || 'Không xác định',
    percentage: row.count
  }));
  
  const totalBuildingScans = buildingDistribution.rows.reduce((sum, row) => sum + parseInt(row.count), 0);
  buildingData.forEach(item => {
    item.percentage = totalBuildingScans > 0 ? ((parseFloat(item.percentage) / totalBuildingScans) * 100).toFixed(1) : 0;
  });

  return {
    overview: {
      totalScansToday: parseInt(totalScansToday.rows[0]?.total || 0),
      successRate: parseFloat(successPercent),
      deniedCount: parseInt(deniedCount.rows[0]?.total || 0),
      peakHour: peakHour.rows[0]?.hour ? `${String(peakHour.rows[0].hour).padStart(2, '0')}:00 - ${String(parseInt(peakHour.rows[0].hour) + 1).padStart(2, '0')}:00` : 'Chưa có dữ liệu',
      peakHourCount: parseInt(peakHour.rows[0]?.count || 0)
    },
    charts: {
      hourlyStats: hourlyData,  // Dữ liệu đã theo giờ VN (0-23)
      buildingDistribution: buildingData
    },
    alerts: {
      topDeniedQr: topDeniedQr.rows || [],
      anomalies: anomalies.rows || []
    },
    recentLogs: recentLogs.rows.map(log => ({
      id: log.id,
      time: log.scan_time,  // Đã là giờ VN
      visitorName: log.visitor_name || 'Không xác định',
      apartmentCode: log.apartment_code || '---',
      result: log.result,
      gate: log.gate || 'Cổng chính',
      qrType: log.qr_type
    })),
    stats: {
      activeResidents: parseInt(overviewStats.rows[0]?.active_residents || 0),
      personalQrCount: parseInt(overviewStats.rows[0]?.personal_qr_count || 0),
      guestQrCount: parseInt(overviewStats.rows[0]?.guest_qr_count || 0)
    }
  };
};

module.exports = { getGuardDashboardStats };