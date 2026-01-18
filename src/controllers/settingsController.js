const CompanySettings = require('../models/CompanySettings');

exports.getSettings = async (req, res) => {
    try {
        let settings = await CompanySettings.findOne();
        if (!settings) {
            // Create default if not exists
            settings = await CompanySettings.create({ company_name: 'My Company' });
        }
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.updateSettings = async (req, res) => {
    try {
        const { company_name, address, city, tax_office, tax_id, trade_registry_no, mersis_no, phone, email, bank_accounts } = req.body;
        let settings = await CompanySettings.findOne();

        const updateData = {
            company_name,
            address,
            city,
            tax_office,
            tax_id,
            trade_registry_no,
            mersis_no,
            phone,
            email,
            bank_accounts: bank_accounts ? JSON.parse(bank_accounts) : [],
        };

        // Cloudinary'den gelen logo URL'si
        if (req.files && req.files.logo && req.files.logo[0]) {
            updateData.logo_path = req.files.logo[0].path; // Cloudinary URL
        }

        // Cloudinary'den gelen watermark URL'si
        if (req.files && req.files.watermark && req.files.watermark[0]) {
            updateData.watermark_path = req.files.watermark[0].path; // Cloudinary URL
        }

        if (settings) {
            await settings.update(updateData);
        } else {
            settings = await CompanySettings.create(updateData);
        }

        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
