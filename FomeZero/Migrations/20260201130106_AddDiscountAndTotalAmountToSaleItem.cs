using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FomeZero.Migrations
{
    /// <inheritdoc />
    public partial class AddDiscountAndTotalAmountToSaleItem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "Discount",
                table: "SaleItems",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "TotalAmount",
                table: "SaleItems",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Discount",
                table: "SaleItems");

            migrationBuilder.DropColumn(
                name: "TotalAmount",
                table: "SaleItems");
        }
    }
}
